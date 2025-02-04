import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crechespots.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWNoZXNwb3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzI0MDAsImV4cCI6MjAyNTQwODQwMH0.YQwFPfQxMYHKGVJUXpKKiOHLZUDqBqAmZvAVQoVN5Hs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});