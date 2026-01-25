
# Documentação Técnica: Integração SKYMiniMercado com Supabase

**Versão:** 1.0
**Data:** 13/01/2026
**Autor:** Arquiteto de Software Sênior

## 1. Introdução

Este documento serve como um guia técnico completo para a migração do sistema de Ponto de Venda (PDV) **SKYMiniMercado** de uma arquitetura baseada em dados locais (`mock-data`) para um backend robusto, escalável e em tempo real utilizando a plataforma **Supabase**.

O objetivo é transformar a aplicação em um sistema de produção, aproveitando os serviços integrados do Supabase, incluindo:
- **PostgreSQL Database:** Para persistência de dados.
- **Auth:** Para autenticação segura de usuários.
- **Row Level Security (RLS):** Para autorização e controle de acesso fino.
- **Realtime:** Para atualizações da UI em tempo real.
- **Storage:** Para armazenamento de arquivos como logos.

---

## 2. Fase 1: Setup e Configuração

### 2.1. Criação do Projeto no Supabase
1.  Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2.  Escolha uma região de servidor próxima à sua base de usuários (ex: `sa-east-1` para São Paulo).
3.  Guarde as credenciais do projeto: **Project URL** e **`anon` public key**.

### 2.2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (ou utilize o sistema de secrets do ambiente de desenvolvimento) com as chaves obtidas:

```
REACT_APP_SUPABASE_URL=SUA_PROJECT_URL
REACT_APP_SUPABASE_ANON_KEY=SUA_ANON_PUBLIC_KEY
```

### 2.3. Inicialização do Cliente Supabase
Crie um arquivo `lib/supabaseClient.ts` para centralizar a inicialização do cliente:

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 3. Fase 2: Schema do Banco de Dados e Migração

O schema será baseado diretamente no arquivo `types.ts`. Os scripts SQL abaixo devem ser executados no **SQL Editor** do Supabase para criar a estrutura de tabelas.

### 3.1. Diagrama de Entidade-Relacionamento (ERD) Conceitual

  <!-- Placeholder para um futuro diagrama -->
*   `employees` (ou `profiles`) terá uma relação 1-para-1 com `auth.users`.
*   `products` terá relações N-para-1 com `categories` e `units`.
*   `sales` terá uma relação N-para-1 com `employees` (operador) e `customers`.
*   `sale_items` será uma tabela de junção para a relação N-para-N entre `sales` e `products`.

### 3.2. Scripts SQL de Criação (Schema)

Execute os seguintes scripts na ordem apresentada.

```sql
-- 1. Tabela de Perfis/Funcionários (vinculada à autenticação)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB NOT NULL
);

-- 2. Categorias e Unidades
CREATE TABLE public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE public.units (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE
);

-- 3. Produtos
CREATE TABLE public.products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) NOT NULL,
  stock_quantity NUMERIC(10, 3) NOT NULL, -- Suporte para 3 casas decimais (KG)
  min_stock_alert NUMERIC(10, 3) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  category_id BIGINT REFERENCES public.categories(id),
  unit_id BIGINT REFERENCES public.units(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clientes
CREATE TABLE public.customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT
);

-- 5. Vendas
CREATE TABLE public.sales (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  operator_id UUID REFERENCES public.employees(id),
  customer_id BIGINT REFERENCES public.customers(id),
  cashier_number INT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  payments JSONB, -- Armazena múltiplos pagamentos
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled', 'reversed')),
  cancellation_reason TEXT,
  reversed_by UUID REFERENCES public.employees(id),
  reversed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Itens da Venda (Tabela de Junção)
CREATE TABLE public.sale_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  quantity NUMERIC(10, 3) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL
);

-- 7. Configurações do Sistema
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1, -- Garante que haja apenas uma linha
  general JSONB
);
```

### 3.3. Migração de Dados Iniciais (Seeding)
Use a interface do Supabase ou scripts SQL para popular tabelas essenciais:
- **`categories` e `units`:** Inserir os dados de `mock-data.ts`.
- **`settings`:** Inserir a configuração inicial.
- **`auth.users` e `employees`:** Cadastrar o usuário `admin@skymini.com` via Auth e criar o perfil correspondente na tabela `employees`.

---

## 4. Fase 3: Autenticação e Autorização

### 4.1. Refatoração da Autenticação
-   **`LoginScreen.tsx`:** Substituir a lógica de busca em array pela chamada `supabase.auth.signInWithPassword()`. Tratar erros de login (senha incorreta, usuário não existe).
-   **`App.tsx`:**
    -   Remover o `useState` para `loggedInUser`.
    -   Usar um `useEffect` com `supabase.auth.onAuthStateChange` para monitorar o estado da sessão.
    -   Quando o usuário estiver autenticado, buscar seus dados da tabela `employees` e popular o estado do usuário.
    -   A função de `logout` chamará `supabase.auth.signOut()`.

**Exemplo de Gerenciamento de Sessão:**
```typescript
// App.tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      // Usuário logado, buscar perfil
      const { data: employeeProfile } = await supabase
        .from('employees')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setLoggedInUser(employeeProfile);
    } else {
      // Usuário deslogado
      setLoggedInUser(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### 4.2. Implementação de Row Level Security (RLS)
RLS é a camada de segurança que garante que os usuários só possam acessar os dados que lhes são permitidos.

1.  **Habilitar RLS:** Vá para a seção `Authentication` > `Policies` no Supabase e habilite o RLS para cada tabela.
2.  **Criar Políticas:**

**Exemplo 1: Funcionários só podem ver a si mesmos (exceto admin/gerente)**
```sql
-- Política na tabela 'employees'
CREATE POLICY "Employees can view their own profile"
ON public.employees FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins and Managers can view all employees"
ON public.employees FOR SELECT
USING (
  (SELECT role FROM public.employees WHERE id = auth.uid()) IN ('Diretor', 'Gerente Geral')
);
```

**Exemplo 2: Apenas usuários com permissão podem editar produtos**
```sql
-- Função auxiliar para checar permissões
CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN AS $$
  SELECT (permissions->>permission_key)::BOOLEAN
  FROM public.employees
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Política na tabela 'products'
CREATE POLICY "Allow modification for users with canManageProducts permission"
ON public.products FOR UPDATE
USING (has_permission('canManageProducts'))
WITH CHECK (has_permission('canManageProducts'));
```
Esta abordagem deve ser repetida para todas as operações (INSERT, UPDATE, DELETE) em todas as tabelas sensíveis.

---

## 5. Fase 4: Refatoração das Operações CRUD

A estratégia é substituir gradualmente toda a manipulação de estado local (`useState` em `App.tsx`) por chamadas à API do Supabase.

### 5.1. Camada de Serviço (Abstração)
Para manter o código organizado, é recomendado criar uma camada de serviço.

**Exemplo para Produtos:**
```typescript
// services/productService.ts
import { supabase } from '../lib/supabaseClient';

export const productService = {
  async getAll() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  },
  async create(newProduct: Omit<Product, 'id'>) {
    const { data, error } = await supabase.from('products').insert(newProduct).select();
    if (error) throw error;
    return data[0];
  },
  // ... update, delete
};
```

### 5.2. Refatoração do Componente Principal `App.tsx`
-   O estado (`products`, `customers`, etc.) será agora preenchido por uma chamada inicial no `useEffect`.
-   As funções de manipulação (`handleAddProduct`, etc.) chamarão os métodos da camada de serviço.

**Exemplo de Refatoração:**

**Antes:**
```typescript
// App.tsx
const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
  setProducts(prev => [...prev, { id: Date.now(), ...newProduct }]);
};
```

**Depois:**
```typescript
// App.tsx
import { productService } from './services/productService';

const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
  try {
    const createdProduct = await productService.create(newProduct);
    setProducts(prev => [...prev, createdProduct]);
    // Exibir notificação de sucesso
  } catch (error) {
    // Exibir notificação de erro
  }
};
```

---

## 6. Fase 5: Funcionalidades em Tempo Real

O Supabase Realtime será usado para atualizar dinamicamente o Dashboard.

**Exemplo no `DashboardScreen.tsx` ou `useDashboardData.ts`:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('public:sales')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sales' },
      (payload) => {
        console.log('Nova venda recebida!', payload.new);
        // Lógica para atualizar o estado do dashboard
        // Ex: Adicionar a nova venda à lista de "Últimas Vendas"
        // e recalcular os KPIs.
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 7. Fase 6: Armazenamento de Arquivos

O Supabase Storage será usado para o upload do logo da empresa.

### 7.1. Configuração do Storage
1.  No dashboard do Supabase, vá para a seção **Storage**.
2.  Crie um novo **Bucket** chamado `company_assets`.
3.  Torne o bucket **público** para que os logos possam ser acessados via URL.

### 7.2. Implementação do Upload
-   **`GeneralSettingsForm.tsx`:** A lógica de upload de arquivo chamará `supabase.storage`.

**Exemplo de Lógica de Upload:**
```typescript
const handleLogoUpload = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company_assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obter a URL pública do arquivo
    const { data } = supabase.storage
      .from('company_assets')
      .getPublicUrl(filePath);
    
    // Salvar a `data.publicUrl` na tabela de `settings`
    const newLogoUrl = data.publicUrl;
    // ...chamar onSave com a nova URL
  } catch (error) {
    // Tratar erro
  }
};
```
