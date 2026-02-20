require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const cors = require('cors');
const multer = require('multer'); // NEW: For handling file uploads

const app = express();
app.use(express.json());
app.use(cors());

// Configure Multer to hold files in memory temporarily before sending to Supabase (Max 2MB)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
    fileFilter: (req, file, cb) => {
        // Checking the file name extension directly is much safer across different browsers
        const allowedExtensions = /\.(pdf|doc|docx)$/i;
        
        if (allowedExtensions.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(null, false); // Silently rejects bad files so the server doesn't crash
        }
    }
});

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = new Map();

// --- HELPER FUNCTION: UPLOAD TO SUPABASE STORAGE ---
async function uploadToSupabase(file, folderName) {
    if (!file) return null;
    
    // Create a unique file name (e.g., leads/1684392_x8d9.pdf)
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folderName}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    // Get the public URL so you can click it in the database/email
    const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
}

// --- ROUTE 1: SEND OTP ---
app.post('/api/send-email-otp', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        otpStore.set(email, { code, expires: Date.now() + 300000 });
        await resend.emails.send({
            from: 'RedBridge Verification <onboarding@resend.dev>',
            to: email,
            subject: 'Your Verification Code',
            html: `<p>Your code is: <strong>${code}</strong></p>`
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email" });
    }
});

// --- ROUTE 2: VERIFY OTP ---
app.post('/api/verify-email-otp', async (req, res) => {
    const { email, code } = req.body;
    const record = otpStore.get(email);
    if (!record || Date.now() > record.expires || record.code !== code) {
        return res.status(400).json({ error: "Invalid or expired code." });
    }
    otpStore.delete(email);
    res.status(200).json({ success: true });
});

// --- ROUTE 3: SUBMIT FINAL LEAD (UPDATED FOR FILES) ---
// Notice the 'upload.single('resumeFile')' added here
app.post('/api/leads', upload.single('resumeFile'), async (req, res) => {
    try {
        // Because we used FormData, the text data was sent as a JSON string. We parse it back.
        const leadData = JSON.parse(req.body.leadData); 
        
        // 1. Upload Resume if it exists
        let resumeUrl = null;
        if (req.file) {
            resumeUrl = await uploadToSupabase(req.file, 'leads');
        }

        // 2. Routing Logic
        const background = (leadData.occ_group || "").toUpperCase();
        const isPriority = ['ICT', 'MKT', 'BUS'].some(tag => background.includes(tag));
        const hasVisa = leadData.curr_visa && leadData.curr_visa !== 'N/A';

        let targetTitles = ['Junior Sales Rep'];
        if (isPriority && hasVisa) targetTitles = ['Senior Sales Rep', 'Vice Manager'];

        const { data: reps } = await supabase
            .from('sales_reps')
            .select('id, email, name')
            .in('title', targetTitles)
            .order('last_assigned_at', { ascending: true })
            .limit(1);

        if (!reps || !reps.length) throw new Error('No reps available');
        const assignedRep = reps[0];

        // 3. Save to Database
        const { error: leadError } = await supabase.from('leads').insert([{ 
            ...leadData, 
            resume_url: resumeUrl, // Save the URL we got from Storage
            assigned_rep_id: assignedRep.id 
        }]);
        if (leadError) throw leadError;

        // 4. Update Rep Rotation
        await supabase.from('sales_reps').update({ last_assigned_at: new Date() }).eq('id', assignedRep.id);

        // 5. Email Notification
        if (assignedRep.email) {
            await resend.emails.send({
                from: 'RedBridge System <onboarding@resend.dev>',
                to: assignedRep.email,
                subject: 'New Lead: ' + leadData.fname,
                html: `
                    <p>New lead <strong>${leadData.fname}</strong> assigned to you.</p>
                    ${resumeUrl ? `<p><a href="${resumeUrl}">View Applicant Resume</a></p>` : ''}
                `
            });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE 4: SAVE PROGRESS ---
app.post('/api/save-progress', async (req, res) => {
    const { email, data } = req.body;
    try {
        const { data: record, error } = await supabase
            .from('incomplete_leads')
            .insert([{ email, form_data: data }])
            .select()
            .single();

        if (error) throw error;
        const resumeLink = `https://vchs123.github.io/redbridge/?resume=${record.id}`;

        await resend.emails.send({
            from: 'RedBridge <onboarding@resend.dev>',
            to: email,
            subject: 'Resume your RedBridge Application',
            html: `<p>You saved your progress. Click below to continue:</p><a href="${resumeLink}">${resumeLink}</a>`
        });

        res.status(200).json({ success: true, link: resumeLink });
    } catch (err) {
        res.status(500).json({ error: "Failed to save progress" });
    }
});

// --- ROUTE 5: RESUME PROGRESS ---
app.get('/api/resume/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('incomplete_leads').select('form_data').eq('id', req.params.id).single();
        if (error || !data) return res.status(404).json({ error: "Saved form not found" });
        res.status(200).json(data.form_data);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- ROUTE 6: EMPLOYER INQUIRY ---
app.post('/api/employers', async (req, res) => {
    const data = req.body;
    try {
        const { error } = await supabase.from('employers').insert([{
            business_name: data.businessName, abn: data.abn, contact_name: data.contactName, contact_title: data.contactTitle,
            email: data.email, phone: data.phone, business_address: data.businessAddress, is_approved_sponsor: data.isApprovedSponsor,
            sponsored_before: data.sponsoredBefore, is_accredited: data.isAccredited, lawful_proof: data.lawfulProof,
            financial_capacity: data.financialCapacity, worker_ratio: data.workerRatio, on_skilled_list: data.onSkilledList,
            willing_to_lmt: data.willingToLMT, provide_jd: data.provideJD, cover_fees: data.coverFees, aware_of_saf: data.awareOfSAF,
            cover_relocation: data.coverRelocation, provide_contract: data.provideContract, meet_compliance: data.meetCompliance, pathway_to_pr: data.pathwayToPR
        }]);

        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit employer inquiry." });
    }
});

// --- ROUTE 7: JOB APPLICATION (NEW) ---
app.post('/api/apply', upload.single('resumeFile'), async (req, res) => {
    try {
        const data = req.body;
        
        // Ensure they actually uploaded a resume (we made it required)
        if (!req.file) throw new Error("Please attach a valid PDF, DOC or DOCX resume (Max 2MB).");
        const resumeUrl = await uploadToSupabase(req.file, 'job_applications');

        const { error } = await supabase.from('job_applications').insert([{
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            linkedin: data.linkedin,
            portfolio: data.portfolio,
            cover_letter: data.coverLetter,
            resume_url: resumeUrl
        }]);

        if (error) throw error;

        // Email Notification to RedBridge HR
        await resend.emails.send({
            from: 'RedBridge Careers <onboarding@resend.dev>',
            to: 'info@red-bridge.com.au',
            subject: 'New Job Application: ' + data.firstName + ' ' + data.lastName,
            html: `
                <h3>New Applicant for Marketing Intern</h3>
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.email} | <strong>Phone:</strong> ${data.phone}</p>
                <p><a href="${resumeUrl}">View Resume</a></p>
                <p><strong>Cover Letter:</strong><br>${data.coverLetter}</p>
            `
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Job App Error:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));