import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);
