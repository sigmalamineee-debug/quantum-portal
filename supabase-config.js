// Supabase Configuration
const SUPABASE_URL = 'https://ausifkhslbkvgyskwrps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c2lma2hzbGJrdmd5c2t3cnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTA2NjYsImV4cCI6MjA4MDU4NjY2Nn0.yovv7wZKSZaykq2Hms6UWvFYy30LUXy68qEAHu5MU3c';

// Initialize Supabase client (using window.supabase from CDN)
let supabaseClient;

// Wait for DOM to load, then initialize
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
        } else {
            console.error('Supabase library not loaded');
        }
    });
}
