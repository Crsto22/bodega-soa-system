import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = "https://qvrrmejfbdcamzgfaefr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnJtZWpmYmRjYW16Z2ZhZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzQxMDMsImV4cCI6MjA3ODU1MDEwM30.dQsC0oH4LvHOPgYPhPnYn-1m5ggo8SLTvKm9fu7n6_w";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnJtZWpmYmRjYW16Z2ZhZWZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NDEwMywiZXhwIjoyMDc4NTUwMTAzfQ.dgT5_jbsvFKc4c8dZFw2AjqjyfyHOqSj0BeHdETeKRw";

// Validar que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Falta configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  );
}

// Crear y exportar el cliente de Supabase con anon key (para operaciones normales)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Crear y exportar el cliente admin de Supabase con service_role key (para operaciones admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
