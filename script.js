/* --- REDBRIDGE GLOBAL SCRIPTS (Version 42 - Fixed) --- */

// --- GLOBAL VARIABLES ---
let isEmailVerified = false; // Tracks if the user has confirmed their OTP

// --- DATA SETS ---
const countriesList = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const visas = [
    "Student Visa | Subclass 500", "Temporary Graduate Visa | Subclass 485", "Visitor Visa | Subclass 600", 
    "Skills in Demand (SID) Visa | Subclass 482", "Work and Holiday Visa | Subclass 462", 
    "Working Holiday Visa | Subclass 417", "Training Visa | Subclass 407", "Other", "N/A"
];

const englishTests = [
    "Cambridge C1 Advanced", "CELPIP General", "IELTS Academic (inc. OSR)", 
    "IELTS General Training (inc. OSR)", "LANGUAGECERT Academic", "Michigan English Test (MET)", 
    "Occupational English Test (OET)", "Pearson Test of English Academic (PTE)", 
    "TOEFL iBT", "N/A"
];

const occupations = {
    ICT: ["135111 Chief Information Officer", "135112 ICT Project Manager", "135199 ICT Managers nec", "261111 ICT Business Analyst", "261112 Systems Analyst", "261313 Software Engineer", "261399 Software and Applications Programmers nec", "261314 Developer Programmer", "262112 ICT Security Specialist", "262113 Systems Administrator", "263111 Computer Network and Systems Engineer", "263211 ICT Quality Assurance Engineer"],
    Health: ["252111 Chiropractor", "252112 Osteopath", "252511 Occupational Therapist", "253111 General Practitioner", "253112 Resident Medical Officer", "253211 Psychiatrist", "253312 Surgeon", "254411 Midwife", "254499 Medical Practitioners nec", "254611 Registered Nurse (Aged Care)", "254712 Registered Nurse (Critical Care and Emergency)", "254718 Registered Nurse (Perioperative)", "254725 Registered Nurse (Surgical)", "254799 Registered Nurses nec"],
    Eng: ["233111 Chemical Engineer", "233211 Civil Engineer", "233411 Structural Engineer", "233511 Industrial Engineer", "233512 Mechanical Engineer", "233611 Mining Engineer", "233912 Ship Engineer", "233913 Transport Engineer", "312112 Bricklayer", "312113 Building Associate", "312611 Furniture Maker", "312710 Wall and Floor Tiler", "312999 Building Trades Workers nec"],
    Bus: ["111111 Chief Executive or Managing Director", "111211 Corporate General Manager", "132111 Corporate Services Manager", "132211 Finance Manager", "132311 Human Resource Manager", "221111 Accountant (General)", "221112 Management Accountant", "221113 Taxation Accountant", "221213 External Auditor", "221214 Internal Auditor", "222311 Financial Investment Adviser", "223111 Human Resource Adviser"],
    Edu: ["241111 Early Childhood (Pre-primary School) Teacher", "241411 Secondary School Teacher", "241511 Special Needs Teacher", "242111 University Lecturer", "242113 Vocational Education Teacher", "249111 Teacher (Primary School)", "249211 Teacher (Middle School)"],
    Mkt: ["225111 Advertising Specialist", "225112 Market Research Analyst", "225113 Marketing Specialist"]
};

// --- INITIALIZATION ---
// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    
    // UPDATED POPULATE FUNCTION
    const populate = (id, list) => { 
        const sel = document.getElementById(id); 
        if (sel) {
            // 1. Clear existing options
            sel.innerHTML = ''; 
            
            // 2. Add the "Default" empty option
            let defaultOpt = document.createElement('option');
            defaultOpt.value = "";      // This is the key! Value is empty.
            defaultOpt.innerHTML = "Select";
            sel.appendChild(defaultOpt);

            // 3. Add the rest of the items
            list.forEach(item => { 
                let opt = document.createElement('option'); 
                opt.value = item; 
                opt.innerHTML = item; 
                sel.appendChild(opt); 
            });
        }
    };
    
    populate('nationality', countriesList.sort());
    populate('countryResidency', countriesList);
    populate('countryGrad', countriesList);
    populate('prevVisa', visas);
    populate('currVisa', visas);
    populate('engTest', englishTests);
    
    for (const [key, list] of Object.entries(occupations)) { 
        const sel = document.getElementById('sel-' + key.toLowerCase()); 
        if(sel) list.forEach(item => { let opt = document.createElement('option'); opt.value = item; opt.innerHTML = item; sel.appendChild(opt); }); 
    }
    
    const observer = new IntersectionObserver((entries) => { 
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }); 
    });
    document.querySelectorAll('.reveal-on-scroll').forEach(section => observer.observe(section));

    const statsSection = document.querySelector('.values-section'); 
    const counters = document.querySelectorAll('.counter'); 
    let started = false;
    
    const statsObserver = new IntersectionObserver((entries) => { 
        if (entries[0].isIntersecting && !started) { 
            counters.forEach(counter => { 
                const target = +counter.getAttribute('data-target'); 
                const isDecimal = target % 1 !== 0; 
                let count = 0; 
                const increment = target / 100; 
                const updateCount = () => { 
                    if (count < target) { 
                        count += increment; 
                        if(isDecimal) counter.innerText = count.toFixed(1); 
                        else counter.innerText = Math.ceil(count); 
                        setTimeout(updateCount, 15); 
                    } else { 
                        if(target === 500) counter.innerText = target + "+"; 
                        else if(target === 95) counter.innerText = target + "%"; 
                        else counter.innerText = target; 
                    } 
                }; 
                updateCount(); 
            }); 
            started = true; 
        } 
    });
    if(statsSection) statsObserver.observe(statsSection);
    
    const accordions = document.querySelectorAll(".accordion-header"); 
    accordions.forEach(acc => { acc.addEventListener("click", function() { this.parentElement.classList.toggle("active"); }); });

    loadLocalData();
});

// --- GLOBAL UI FUNCTIONS ---
function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }
function openModal() { document.getElementById('consultationModal').style.display = 'flex'; }
function closeModal() { document.getElementById('consultationModal').style.display = 'none'; }

function saveProgress() { 
    const email = document.getElementById('email').value; 
    if(!email) {
        alert("Please enter your email in Step 1 so we can send you the resume link.");
        showTab(0);
        document.getElementById('email').focus();
    } else { 
        saveLocalData();
        alert(`Progress Saved! \n\nYour data is saved locally on this browser. In the full version, a secure link would be sent to ${email}.`); 
        closeModal(); 
    } 
}

function saveLocalData() {
    const formData = {};
    const inputs = document.getElementById('multiStepForm').elements;
    for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];
        if (el.id && el.type !== 'file' && el.type !== 'submit') {
            formData[el.id] = el.value;
        }
    }
    formData['currentTab'] = currentTab;
    localStorage.setItem('rb_consultation_data', JSON.stringify(formData));
}

function loadLocalData() {
    const savedData = localStorage.getItem('rb_consultation_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        for (const [key, value] of Object.entries(data)) {
            const el = document.getElementById(key);
            if (el && key !== 'currentTab') { el.value = value; }
        }
        handleContactMethod();
        handleLocationLogic();
        handleVisaHistoryLogic();
        handleOccupationLogic();
        handleEduLogic();
        handleWorkExpLogic();
        handleEngLogic();
        handleVisaExpiryLogic();
    }
}

function openQrModal(type) { if(type === 'wechat') document.getElementById('wechat-modal').style.display = 'flex'; if(type === 'tiktok') document.getElementById('tiktok-modal').style.display = 'flex'; }
function closeQrModal(type) { if(type === 'wechat') document.getElementById('wechat-modal').style.display = 'none'; if(type === 'tiktok') document.getElementById('tiktok-modal').style.display = 'none'; }
window.onclick = function(event) { if (event.target == document.getElementById('consultationModal')) closeModal(); if (event.target.classList.contains('qr-modal-overlay')) { event.target.style.display = 'none'; } }
window.onscroll = function() { const btn = document.getElementById("backToTop"); if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) btn.style.display = "block"; else btn.style.display = "none"; }
function topFunction() { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }

let currentTab = 0; 
showTab(currentTab);

function showTab(n) {
    let x = document.getElementsByClassName("form-step");
    for (let i = 0; i < x.length; i++) x[i].style.display = "none";
    x[n].style.display = "block";
    
    document.getElementById("prevBtn").style.display = (n == 0) ? "none" : "inline";
    let nextBtn = document.getElementById("nextBtn");
    
    if (n == (x.length - 1)) {
        nextBtn.innerHTML = "Submit";
        generateSummary();
    } else if (n == 3) { 
        handleSkipLogic(); 
    } else {
        nextBtn.innerHTML = "Next";
    }
    
    document.getElementById("progressBar").style.width = ((n + 1) / x.length) * 100 + "%";
    document.getElementById("step-title").innerText = "Step " + (n + 1) + " of " + x.length;
}

function nextPrev(n) {
    let x = document.getElementsByClassName("form-step");
    if (n == 1 && !validateForm()) return false;
    
    if (currentTab == 3 && n == 1) {
        const val = document.getElementById('continueExtra').value;
        if (val === 'No') {
            currentTab = x.length - 1; 
            showTab(currentTab);
            saveLocalData();
            return;
        }
    }

    if (currentTab == (x.length - 1) && n == -1) {
        const val = document.getElementById('continueExtra').value;
        if (val === 'No') {
            currentTab = 3; 
            showTab(currentTab);
            return;
        }
    }

    currentTab = currentTab + n;
    
    // --- THIS WAS THE BROKEN PART, NOW FIXED ---
    if (currentTab >= x.length) { 
        submitForm(); // Just call the function!
        return false; 
    }
    // -------------------------------------------
    
    showTab(currentTab);
    saveLocalData();
}

function validateForm() {
    let x = document.getElementsByClassName("form-step");
    let y = x[currentTab].querySelectorAll("input, select, textarea");
    let valid = true;
    for (let i = 0; i < y.length; i++) {
        if (y[i].offsetParent === null) continue;
        if (y[i].hasAttribute('required') && y[i].value == "") { 
            y[i].style.borderColor = "red"; valid = false; 
        } 
        else if (y[i].classList.contains('positive-int') && y[i].value < 0) {
            y[i].style.borderColor = "red"; valid = false;
        }
        else { y[i].style.borderColor = "transparent"; }
    }
    return valid; 
}

// --- VERIFY FIELD (Request OTP) ---
async function verifyField(type) { 
    if (type === 'mobile') return; 

    const emailValue = document.getElementById('email').value;
    if (!emailValue) {
        alert("Please enter an email address first.");
        return;
    }

    const btn = document.querySelector('.input-with-btn button');
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch('https://redbridge.onrender.com/api/send-email-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailValue })
        });

        if (response.ok) {
            alert("Verification code sent to " + emailValue + "\n(Check your spam folder if using a test email)"); 
            document.getElementById('email-otp').classList.remove('hidden'); 
        } else {
            alert("Failed to send code. Please try again.");
        }
    } catch (error) {
        console.error("OTP Error:", error);
        alert("Server error. Is 'node server.js' running?");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// --- VALIDATE OTP (Check Code) ---
async function validateOtp() {
    const email = document.getElementById('email').value;
    const code = document.getElementById('otpInput').value;
    const msgSpan = document.getElementById('otp-message');

    if (!code) {
        alert("Please enter the code sent to your email.");
        return;
    }

    try {
        const response = await fetch('https://redbridge.onrender.com/api/verify-email-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const result = await response.json();

        if (response.ok) {
            isEmailVerified = true;
            msgSpan.style.color = "#4BB543"; // Success Green
            msgSpan.innerText = "✓ Email Verified Successfully";
            
            // Lock fields and hide verify button
            document.getElementById('email').disabled = true;
            document.getElementById('otpInput').disabled = true;
            document.querySelector('.input-with-btn button').style.display = 'none'; 
        } else {
            msgSpan.style.color = "red";
            msgSpan.innerText = "⚠ " + result.error;
        }
    } catch (error) {
        console.error(error);
        alert("Server error during verification.");
    }
}

// --- SUBMIT FUNCTION ---
async function submitForm() {
    // 1. SAFETY CHECK (Force Email Verification)
    if (!isEmailVerified) {
        alert("Please verify your email address in Step 1 before submitting.");
        showTab(0); // Jump back to Step 1
        return;
    }

    // 2. Gather Data
    const formData = {
        fname: document.getElementById('fname').value,
        lname: document.getElementById('lname').value,
        email: document.getElementById('email').value,
        mobile: document.getElementById('mobile').value,
        pref_contact: document.getElementById('prefContact').value,
        whatsapp_val: document.getElementById('whatsappVal')?.value || null,
        wechat_val: document.getElementById('wechatVal')?.value || null,
        source: document.getElementById('source').value,
        budget: document.getElementById('budget').value,
        gender: document.getElementById('gender').value,
        nationality: document.getElementById('nationality').value,
        country_residency: document.getElementById('countryResidency').value,
        applied_prev: document.getElementById('appliedPrev')?.value || null,
        location_australia: document.getElementById('locationSelect')?.value || null,
        willing_relocate: document.getElementById('relocateVal')?.value || null,
        visa_cancel: document.getElementById('visaCancel').value,
        dob: document.getElementById('dob').value,
        prev_visa: document.getElementById('prevVisa').value,
        curr_visa: document.getElementById('currVisa').value,
        visa_expiry: document.getElementById('visaExpiry')?.value || null,
        consult_type: document.getElementById('consultType').value,
        occ_group: document.getElementById('occGroup').value,
        edu_level: document.getElementById('eduLevel').value,
        grad_year: parseInt(document.getElementById('gradYear').value) || null,
        country_grad: document.getElementById('countryGrad').value,
        bach_major: document.getElementById('bachMajor')?.value || null,
        mast_major: document.getElementById('mastMajor')?.value || null,
        work_exp_years: document.getElementById('workExpYears').value,
        rel_job_title: document.getElementById('relJobTitle')?.value || null,
        rel_job_duties: document.getElementById('relJobDuties')?.value || null,
        lat_job_title: document.getElementById('latJobTitle')?.value || null,
        lat_job_duties: document.getElementById('latJobDuties')?.value || null,
        eng_test: document.getElementById('engTest').value,
        test_date: document.getElementById('testDate')?.value || null,
        eng_writing: parseInt(document.getElementById('engWriting')?.value) || 0,
        eng_listening: parseInt(document.getElementById('engListening')?.value) || 0,
        eng_speaking: parseInt(document.getElementById('engSpeaking')?.value) || 0,
        eng_reading: parseInt(document.getElementById('engReading')?.value) || 0,
        eng_overall: parseInt(document.getElementById('engOverall')?.value) || 0
    };

    // 3. Send to Server
    try {
        const response = await fetch('https://redbridge.onrender.com/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert("Thank you! Your professional profile has been submitted and assigned to a RedBridge specialist.");
            localStorage.removeItem('rb_consultation_data');
            closeModal();
        } else {
            const result = await response.json();
            throw new Error(result.error || 'Server error');
        }
    } catch (error) {
        console.error('Submission Error:', error);
        alert("Check if your server is running in the Cursor terminal! (node server.js)");
    }
}

// --- HELPER LOGIC FUNCTIONS ---
function handleContactMethod() { document.getElementById('field-whatsapp').classList.add('hidden'); document.getElementById('field-wechat').classList.add('hidden'); const val = document.getElementById('prefContact').value; if(val === 'WhatsApp') document.getElementById('field-whatsapp').classList.remove('hidden'); if(val === 'WeChat') document.getElementById('field-wechat').classList.remove('hidden'); }

function handleLocationLogic() { 
    const country = document.getElementById('countryResidency').value;
    const locationSelect = document.getElementById('locationSelect');
    const locationVal = locationSelect.value;
    
    if(country === 'Australia') {
        document.getElementById('field-location').classList.remove('hidden');
        document.getElementById('field-applied-prev').classList.add('hidden');
        if(locationVal && locationVal !== 'Melbourne') document.getElementById('field-relocate').classList.remove('hidden'); 
        else document.getElementById('field-relocate').classList.add('hidden');
        document.getElementById('field-visa-cancel').classList.remove('hidden');
        document.getElementById('field-visa-prev').classList.remove('hidden');
        document.getElementById('field-visa-curr').classList.remove('hidden');
        handleVisaExpiryLogic(); 
    } else {
        document.getElementById('field-location').classList.add('hidden');
        document.getElementById('field-relocate').classList.remove('hidden'); 
        document.getElementById('field-applied-prev').classList.remove('hidden'); 
        handleVisaHistoryLogic();
    }
}

function handleVisaExpiryLogic() {
    const val = document.getElementById('currVisa').value;
    if(val === 'N/A') document.getElementById('field-visa-expiry').classList.add('hidden');
    else document.getElementById('field-visa-expiry').classList.remove('hidden');
}

function handleVisaHistoryLogic() {
    const country = document.getElementById('countryResidency').value;
    const applied = document.getElementById('appliedPrev').value;
    const visaFields = [document.getElementById('field-visa-cancel'), document.getElementById('field-visa-prev'), document.getElementById('field-visa-curr'), document.getElementById('field-visa-expiry')];
    if (country !== 'Australia') {
        if (applied === 'No') { visaFields.forEach(el => el.classList.add('hidden')); } 
        else if (applied === 'Yes') { 
            visaFields.forEach(el => el.classList.remove('hidden')); 
            handleVisaExpiryLogic();
        } 
        else { visaFields.forEach(el => el.classList.add('hidden')); }
    }
}

function handleOccupationLogic() { document.querySelectorAll('[id^="list-"]').forEach(el => el.classList.add('hidden')); const grp = document.getElementById('occGroup').value.toLowerCase(); const target = document.getElementById('list-' + grp); if(target) target.classList.remove('hidden'); }

function handleEduLogic() { 
    const lvl = document.getElementById('eduLevel').value; 
    document.getElementById('field-bach').classList.add('hidden'); 
    document.getElementById('field-mast').classList.add('hidden'); 
    if(lvl === "Bachelor's" || lvl === "Master's" || lvl === "Doctorate") {
        document.getElementById('field-bach').classList.remove('hidden'); 
    }
    if(lvl === "Master's" || lvl === "Doctorate") { 
        document.getElementById('field-mast').classList.remove('hidden'); 
    }
}

function handleWorkExpLogic() {
    const years = document.getElementById('workExpYears').value;
    if(years === "Less than 1 year") {
        document.getElementById('job-relevant').classList.add('hidden');
        document.getElementById('job-latest').classList.remove('hidden');
        document.getElementById('relJobTitle').removeAttribute('required');
        document.getElementById('latJobTitle').setAttribute('required', '');
    } else {
        document.getElementById('job-relevant').classList.remove('hidden');
        document.getElementById('job-latest').classList.add('hidden');
        document.getElementById('latJobTitle').removeAttribute('required');
        document.getElementById('relJobTitle').setAttribute('required', '');
    }
}

function handleEngLogic() { const val = document.getElementById('engTest').value; if(val && val !== 'Select' && val !== 'N/A') document.getElementById('engScores').classList.remove('hidden'); else document.getElementById('engScores').classList.add('hidden'); }

function handleSkipLogic() {
    const val = document.getElementById('continueExtra').value;
    const btn = document.getElementById('nextBtn');
    if(val === 'No') btn.innerHTML = "Skip";
    else btn.innerHTML = "Next";
}

function generateSummary() {
    const container = document.getElementById('summary-content');
    
    // FORCE VERTICAL STACKING
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "20px";
    
    let html = '';

    // Helper to get value safely
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };

    const sections = [
        {
            title: "1. Contact Information",
            fields: [
                { id: 'fname', label: 'First Name' }, 
                { id: 'lname', label: 'Last Name' },
                { id: 'email', label: 'Email' }, 
                { id: 'mobile', label: 'Mobile' },
                { id: 'prefContact', label: 'Preferred Contact' },
                { id: 'whatsappVal', label: 'WhatsApp', showIf: () => getValue('prefContact') === 'WhatsApp' }, 
                { id: 'wechatVal', label: 'WeChat ID', showIf: () => getValue('prefContact') === 'WeChat' },
                { id: 'source', label: 'Source' }, 
                { id: 'budget', label: 'Budget' }
            ]
        },
        {
            title: "2. Personal Details",
            fields: [
                { id: 'gender', label: 'Gender' }, 
                { id: 'nationality', label: 'Nationality' },
                { id: 'countryResidency', label: 'Residency' }, 
                { id: 'appliedPrev', label: 'Applied Previously?' }, 
                { id: 'locationSelect', label: 'Current Location', showIf: () => getValue('countryResidency') === 'Australia' }, 
                { id: 'relocateVal', label: 'Willing to Relocate?' }
            ]
        },
        {
            title: "3. Visa & Consultation",
            fields: [
                { id: 'visaCancel', label: 'Visa History' }, 
                { id: 'dob', label: 'Date of Birth' },
                { id: 'prevVisa', label: 'Previous Visa' }, 
                { id: 'currVisa', label: 'Current Visa' },
                { id: 'visaExpiry', label: 'Visa Expiry' }, 
                { id: 'consultType', label: 'Consultation Type' },
                { id: 'occGroup', label: 'Target Industry' },
                
                // CONDITIONAL LOGIC ADDED HERE:
                { id: 'sel-ict', label: 'Occupation (ICT)', showIf: () => getValue('occGroup') === 'ICT' },
                { id: 'sel-health', label: 'Occupation (Health)', showIf: () => getValue('occGroup') === 'Health' },
                { id: 'sel-eng', label: 'Occupation (Engineering)', showIf: () => getValue('occGroup') === 'Eng' },
                { id: 'sel-bus', label: 'Occupation (Business)', showIf: () => getValue('occGroup') === 'Bus' },
                { id: 'sel-edu', label: 'Occupation (Education)', showIf: () => getValue('occGroup') === 'Edu' },
                { id: 'sel-mkt', label: 'Occupation (Marketing)', showIf: () => getValue('occGroup') === 'Mkt' }
            ]
        },
        {
            title: "4. Education History",
            fields: [
                { id: 'eduLevel', label: 'Education Level' }, 
                { id: 'gradYear', label: 'Graduation Year' },
                { id: 'countryGrad', label: 'Graduation Country' }, 
                { id: 'bachMajor', label: 'Bachelor Major' }, 
                { id: 'mastMajor', label: 'Master Major' }
            ]
        },
        {
            title: "5. Work Experience",
            fields: [
                { id: 'workExpYears', label: 'Years of Experience' }, 
                { id: 'relJobTitle', label: 'Relevant Job Title' },
                { id: 'relJobDuties', label: 'Relevant Duties' }, 
                { id: 'latJobTitle', label: 'Latest Job Title' }, 
                { id: 'latJobDuties', label: 'Latest Duties' },
                { id: 'resumeUpload', label: 'Resume File', isFile: true }
            ]
        },
        {
            title: "6. English Proficiency",
            fields: [
                { id: 'engTest', label: 'English Test' }, 
                { id: 'testDate', label: 'Test Date' },
                { id: 'engWriting', label: 'Writing Score' }, 
                { id: 'engListening', label: 'Listening Score' },
                { id: 'engSpeaking', label: 'Speaking Score' }, 
                { id: 'engReading', label: 'Reading Score' },
                { id: 'engOverall', label: 'Overall Score' }
            ]
        }
    ];

    sections.forEach(section => {
        const validFields = section.fields.filter(f => {
            const el = document.getElementById(f.id);
            
            // 1. Basic Check: Does element exist?
            if (!el) return false;

            // 2. Logic Check: Does it pass the 'showIf' condition? (If no condition exists, assume true)
            if (f.showIf && !f.showIf()) return false;

            // 3. Value Check: Is it empty or "Select"?
            return el.value && el.value.trim() !== "" && !el.value.toLowerCase().includes("select");
        });

        if (validFields.length > 0) {
            html += `<div style="width: 100%; border-bottom: 1px solid #444; padding-bottom: 15px;">
                        <h4 style="color: #E65400; font-size: 1rem; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">
                            ${section.title}
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">`;
            
            validFields.forEach(f => {
                const el = document.getElementById(f.id);
                let value = el.value;
                if (f.isFile && el.files.length > 0) value = el.files[0].name;
                
                html += `<div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.9rem;">
                            <span style="color: #cccccc; font-weight: 400; width: 40%; text-align: left;">${f.label}:</span>
                            <span style="color: #ffffff; font-weight: 600; width: 55%; text-align: right; word-break: break-word;">${value}</span>
                         </div>`;
            });

            html += `   </div>
                     </div>`;
        }
    });

    if (html === "") {
        html = `<p style="text-align:center; color:#888;">No details provided yet.</p>`;
    }

    container.innerHTML = html;
}