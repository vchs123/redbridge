// portal/auth.js

// 1. ADD YOUR SUPABASE DETAILS HERE
// You can find these in Supabase -> Project Settings -> API
const SUPABASE_URL = 'https://mnrvlpxbhlwbeteannzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucnZscHhiaGx3YmV0ZWFubnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTUxNjYsImV4cCI6MjA4Njk3MTE2Nn0.ccw62vNxiZooSqaMc9YQRCrsUQMQ86vpSDpBSt4vh7Q';

// Initialize the Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LOGIN FUNCTION ---
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        throw error;
    }
    return data;
}

// --- LOGOUT FUNCTION ---
async function logoutUser() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- SECURITY GUARD FUNCTION (Protects the Dashboard) ---
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = "index.html";
    } else {
        const userEmail = session.user.email;
        const userNameElement = document.getElementById('sidebarUserName');
        if(userNameElement) {
            userNameElement.innerText = userEmail.split('@')[0];
        }
    }
}

// --- SET/UPDATE PASSWORD FUNCTION ---
async function updateUserPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        throw error;
    }
    return data;
}