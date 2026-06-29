import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyzsylmxlrouxxpxhtlr.supabase.co';
// Substituímos pela chave 'anon' pública (Legacy JWT)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enN5bG14bHJvdXh4cHhodGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTM1ODEsImV4cCI6MjA5ODI2OTU4MX0.vDPomKPufQQ6f9YlwOwNsnN9r2yMZ9ai64L8VPBLl_4';

export const supabase = createClient(supabaseUrl, supabaseKey);