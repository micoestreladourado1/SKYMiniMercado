
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase.
const supabaseUrl = 'https://kueusdaggwyxuzilpkyo.supabase.co';

// Chave pública 'anon' do projeto Supabase, fornecida pelo usuário.
// Esta é a chave correta e atual para autenticação.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZXVzZGFnZ3d5eHV6aWxwa3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDUyMzEsImV4cCI6MjA4Mzg4MTIzMX0.gad3JCs_Mn0j5kmcaZgYsOQZ2RNXdwPHX9j3Oc7J_wI';

// Validação simples para garantir que as variáveis existem.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("A URL e a Chave Anon do Supabase são obrigatórias.");
}

// Cria e exporta o cliente Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
