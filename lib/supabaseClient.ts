
import { createClient } from '@supabase/supabase-js';

// URL e Chave do projeto Supabase vindas das variáveis de ambiente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação simples para garantir que as variáveis existem.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
  throw new Error("A URL e a Chave Anon do Supabase são obrigatórias.");
}

// Cria e exporta o cliente Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
