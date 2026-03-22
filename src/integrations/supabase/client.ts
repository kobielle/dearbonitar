import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR REAL KEYS FROM SUPABASE
const SUPABASE_URL = 'https://gpzfaopgaiseyrhposzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwemZhb3BnYWlzZXlyaHBvc3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjQ4ODAsImV4cCI6MjA4OTcwMDg4MH0.MuyDPi-D3ldUt3MkylMYAYLmtoeIFg16JK-Q-LJsf0Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});