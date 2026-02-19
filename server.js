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

// Memory Store for OTPs
const otpStore = new Map();

// --- ROUTE 1: SEND OTP ---
app.post('/api/send-email-otp', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        otpStore.set(email, { code, expires: Date.now() + 300000 }); // 5 min expiry

        await resend.emails.send({
            from: 'RedBridge Verification <onboarding@resend.dev>', // Update this once you verify your domain in Resend
            to: email,
            subject: 'Your Verification Code',
            html: `<p>Your code is: <strong>${code}</strong></p>`
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// --- ROUTE 2: VERIFY OTP ---
app.post('/api/verify-email-otp', async (req, res) => {
    const { email, code } = req.body;
    const record = otpStore.get(email);

    if (!record) return res.status(400).json({ error: "No code requested." });
    if (Date.now() > record.expires) {
        otpStore.delete(email);
        return res.status(400).json({ error: "Code expired." });
    }
    if (record.code !== code) return res.status(400).json({ error: "Invalid code." });

    otpStore.delete(email);
    res.status(200).json({ success: true });
});

// --- ROUTE 3: SUBMIT LEAD (With Email Notification) ---
app.post('/api/leads', async (req, res) => {
    const leadData = req.body;

    try {
        // 1. Logic to determine seniority needed
        const background = (leadData.occ_group || "").toUpperCase();
        const isPriority = ['ICT', 'MKT', 'BUS'].some(tag => background.includes(tag));
        const hasVisa = leadData.curr_visa && leadData.curr_visa !== 'N/A';

        let targetTitles = ['Junior Sales Rep'];
        if (isPriority && hasVisa) targetTitles = ['Senior Sales Rep', 'Vice Manager'];

        // 2. Find available Rep
        const { data: reps, error: repError } = await supabase
            .from('sales_reps')
            .select('id, email, name')
            .in('title', targetTitles)
            .order('last_assigned_at', { ascending: true })
            .limit(1);

        if (repError || !reps.length) throw new Error('No sales reps available');
        const assignedRep = reps[0];

        // 3. Save Lead to Supabase
        const { error: leadError } = await supabase
            .from('leads')
            .insert([{ ...leadData, assigned_rep_id: assignedRep.id }]);

        if (leadError) throw leadError;

        // 4. Update Rep Rotation Timestamp
        await supabase.from('sales_reps').update({ last_assigned_at: new Date() }).eq('id', assignedRep.id);

        // 5. SEND NOTIFICATION EMAIL (ENABLED)
        if (assignedRep.email) {
            await resend.emails.send({
                from: 'RedBridge System <onboarding@resend.dev>',
                to: assignedRep.email, // This sends to the Rep
                subject: 'New Lead Assigned: ' + leadData.fname,
                html: `
                    <h3>New Lead Assigned</h3>
                    <p><strong>Name:</strong> ${leadData.fname} ${leadData.lname}</p>
                    <p><strong>Phone:</strong> ${leadData.mobile}</p>
                    <p><strong>Industry:</strong> ${leadData.occ_group}</p>
                    <p>Please contact them within 2 hours.</p>
                `
            });
            console.log(`Notification sent to ${assignedRep.name}`);
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));