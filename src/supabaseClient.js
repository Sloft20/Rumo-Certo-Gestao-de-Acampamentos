import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltaznustoryrpotxzrdj.supabase.co';
// Substituímos pela chave 'anon' pública (Legacy JWT)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0YXpudXN0b3J5cnBvdHh6cmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDMzMDUsImV4cCI6MjEwMTA3OTMwNX0.AeTrBnwvOAf2QcSUjcE3UyK93VMkfWSaOsDH_wf3Hh8';

export const supabase = createClient(supabaseUrl, supabaseKey);