require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = new Map();

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

// --- ROUTE 3: SUBMIT FINAL LEAD ---
app.post('/api/leads', async (req, res) => {
    const leadData = req.body;
    try {
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

        const { error: leadError } = await supabase.from('leads').insert([{ ...leadData, assigned_rep_id: assignedRep.id }]);
        if (leadError) throw leadError;

        await supabase.from('sales_reps').update({ last_assigned_at: new Date() }).eq('id', assignedRep.id);

        if (assignedRep.email) {
            await resend.emails.send({
                from: 'RedBridge System <onboarding@resend.dev>',
                to: assignedRep.email,
                subject: 'New Lead: ' + leadData.fname,
                html: `<p>New lead <strong>${leadData.fname}</strong> assigned to you.</p>`
            });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE 4: SAVE PROGRESS (NEW) ---
app.post('/api/save-progress', async (req, res) => {
    const { email, data } = req.body;
    try {
        const { data: record, error } = await supabase
            .from('incomplete_leads')
            .insert([{ email, form_data: data }])
            .select()
            .single();

        if (error) throw error;

        // Use your live GitHub Pages URL here
        const resumeLink = `https://vchs123.github.io/redbridge/?resume=${record.id}`;

        await resend.emails.send({
            from: 'RedBridge <onboarding@resend.dev>',
            to: email,
            subject: 'Resume your RedBridge Application',
            html: `<p>Thank you for starting your inquiry application with redBridge Consulting. Your progress is saved. Click below to continue:</p>
                   <a href="${resumeLink}">${resumeLink}</a>`
        });

        res.status(200).json({ success: true, link: resumeLink });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save progress" });
    }
});

// --- ROUTE 5: RESUME PROGRESS (NEW) ---
app.get('/api/resume/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('incomplete_leads')
            .select('form_data')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: "Saved form not found" });
        res.status(200).json(data.form_data);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- ROUTE 6: EMPLOYER INQUIRY (NEW) ---
app.post('/api/employers', async (req, res) => {
    const data = req.body;
    
    try {
        // 1. Save to Supabase 'employers' table
        const { error } = await supabase
            .from('employers')
            .insert([{
                business_name: data.businessName,
                abn: data.abn,
                contact_name: data.contactName,
                contact_title: data.contactTitle,
                email: data.email,
                phone: data.phone,
                business_address: data.businessAddress,
                is_approved_sponsor: data.isApprovedSponsor,
                sponsored_before: data.sponsoredBefore,
                is_accredited: data.isAccredited,
                lawful_proof: data.lawfulProof,
                financial_capacity: data.financialCapacity,
                worker_ratio: data.workerRatio,
                on_skilled_list: data.onSkilledList,
                willing_to_lmt: data.willingToLMT,
                provide_jd: data.provideJD,
                cover_fees: data.coverFees,
                aware_of_saf: data.awareOfSAF,
                cover_relocation: data.coverRelocation,
                provide_contract: data.provideContract,
                meet_compliance: data.meetCompliance,
                pathway_to_pr: data.pathwayToPR
            }]);

        if (error) throw error;

        // 2. Email Notification to RedBridge Team
        await resend.emails.send({
            from: 'RedBridge System <onboarding@resend.dev>', // Change to your verified domain later
            to: 'vanessa@red-bridge.com.au', // Change this to whoever handles B2B leads
            subject: '🚨 New Employer Sponsorship Inquiry: ' + data.businessName,
            html: `
                <h3>New Employer Inquiry</h3>
                <p><strong>Business:</strong> ${data.businessName} (ABN: ${data.abn})</p>
                <p><strong>Contact:</strong> ${data.contactName} (${data.contactTitle})</p>
                <p><strong>Email:</strong> ${data.email} | <strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Address:</strong> ${data.businessAddress}</p>
                <br>
                <p>Please log in to Supabase to view their full compliance and sponsorship history.</p>
            `
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Employer Submit Error:', err);
        res.status(500).json({ error: "Failed to submit employer inquiry." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));