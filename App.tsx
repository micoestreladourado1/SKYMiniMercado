

import React, { useState, useEffect } from 'react';
import PosScreen from './components/PosScreen';
import Sidebar from './components/Sidebar';
import ProductManagementScreen from './components/ProductManagementScreen';
import AccountsReceivableScreen from './components/AccountsReceivableScreen';
import InternalUseScreen from './components/InternalUseScreen';
import CategoryManagementScreen from './components/CategoryManagementScreen';
import UnitManagementScreen from './components/UnitManagementScreen';
import EmployeeManagementScreen from './components/EmployeeManagementScreen';
import LoginScreen from './components/LoginScreen';
import PasswordResetScreen from './components/PasswordResetScreen';
import CashierScreen from './components/CashierScreen';
import StockScreen from './components/StockScreen';
import ShoppingListScreen from './components/ShoppingListScreen';
import CustomerManagementScreen from './components/CustomerManagementScreen';
import DashboardScreen from './components/DashboardScreen';
import SalesScreen from './components/SalesScreen';
import SettingsScreen from './components/SettingsScreen';
import GlobalHeader from './components/GlobalHeader';
import NotificationsModal from './components/NotificationsModal';
import LoadingSpinner from './components/LoadingSpinner';
import ToastNotification from './components/ToastNotification';
import useDashboardData from './hooks/useDashboardData';
import { AppScreen, Product, ReceivableEntry, CartItem, Customer, InternalUseEntry, Category, Unit, Employee, CashierState, CompletedSale, PaymentMethod, SystemSettings } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('pos');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<ReceivableEntry[]>([]);
  const [internalUseEntries, setInternalUseEntries] = useState<InternalUseEntry[]>([]);
  const [cashierState, setCashierState] = useState<CashierState>({ id: 1, status: 'closed', cashierNumber: 1 });
  const [currentSessionSales, setCurrentSessionSales] = useState<CompletedSale[]>([]);
  const [allSales, setAllSales] = useState<CompletedSale[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      companyName: 'Carregando...', tradingName: 'SKYMiniMercado', cnpj: '', address: '', logoUrl: '',
      timezone: 'America/Sao_Paulo', language: 'pt-BR', currency: 'BRL', autoDateTime: true, dailySalesGoal: 0,
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);



  const [connectionError, setConnectionError] = useState<string | null>(null); // NEW STATE FOR ERROR UI

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setConnectionError(null); // Clear errors on state change
        setLoadingStatus('Verificando autenticação...'); // Update status
        if (_event === 'PASSWORD_RECOVERY') {
          setIsResettingPassword(true);
          setLoggedInUser(null);
        } else if (session?.user) {
          setLoadingStatus('Buscando perfil do usuário...'); // Update status
          setIsResettingPassword(false);

          // Timeout helper (increased to 20s)
          const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

          try {
            const userProfilePromise = supabase
              .from('employees')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Race between fetch and 20s timeout
            const { data: employeeProfileData, error } = await Promise.race([
              userProfilePromise,
              timeout(20000)
            ]) as any;

            if (error) throw error;

            if (employeeProfileData) {
              const fullEmployeeProfile: Employee = {
                ...employeeProfileData,
                id: session.user.id,
                email: session.user.email || '',
                isActive: employeeProfileData.is_active,
              };
              setLoggedInUser(fullEmployeeProfile);
              setCurrentScreen(fullEmployeeProfile.permissions.canViewDashboard ? 'dashboard' : 'pos');
            } else {
              throw new Error("Perfil não encontrado no banco de dados.");
            }

          } catch (err: any) {
            console.error("Error fetching employee profile (or timeout):", err);

            // CRITICAL FIX: Only show blocking error if NO user is currently logged in.
            // If we have a loggedInUser, this is likely a background token refresh that failed/timed out.
            // We should NOT disrupt the user's work.
            setLoggedInUser(currentUser => {
              if (!currentUser) {
                setConnectionError(`Erro ao conectar: ${err.message || 'Tempo limite excedido'}. \nID: ${session.user.id}`);
                setLoadingStatus('Erro de conexão.');
              } else {
                console.warn("Background auth check failed, but session is active. Ignoring error to prevent crash.");
              }
              return currentUser; // Return existing state
            });
          }
        } else {
          setIsResettingPassword(false);
          setLoggedInUser(null);
        }
      } catch (e) {
        console.error("An error occurred during auth state change:", e);
        setLoggedInUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [loadingStatus, setLoadingStatus] = useState('Iniciando...'); // NEW STATE

  const fetchAllProductsInChunks = async (onProgress?: (count: number) => void) => {
    let allProducts: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      if (onProgress) onProgress(allProducts.length);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(from, from + pageSize - 1)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        allProducts = [...allProducts, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }
    return allProducts;
  };


  const fetchInitialData = React.useCallback(async () => {
    if (loggedInUser) {
      setDataLoading(true);
      try {
        setLoadingStatus('Carregando dados principais...');

        // Start fetching products separately to handle pagination reference
        const productsPromise = fetchAllProductsInChunks((count) => setLoadingStatus(`Carregando produtos (${count})...`));

        const [productsData, categoriesRes, unitsRes, customersRes, employeesRes, settingsRes, receivablesRes, internalUseRes] = await Promise.all([
          productsPromise,
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase.from('units').select('*').order('name', { ascending: true }),
          supabase.from('customers').select('*').order('name', { ascending: true }),
          supabase.from('employees').select('*, is_active').order('name', { ascending: true }),
          supabase.from('settings').select('general').eq('id', 1).single(),
          supabase.from('receivables').select('*').order('created_at', { ascending: false }),
          supabase.from('internal_use').select('*').order('created_at', { ascending: false }),
        ]);

        setLoadingStatus('Processando produtos...');
        // Products are already an array from our helper function
        setProducts(productsData || []);

        if (categoriesRes.error) throw categoriesRes.error;
        setCategories(categoriesRes.data || []);

        if (unitsRes.error) throw unitsRes.error;
        setUnits(unitsRes.data || []);

        if (customersRes.error) throw customersRes.error;
        setCustomers(customersRes.data || []);

        if (employeesRes.error) throw employeesRes.error;
        const mappedEmployees = (employeesRes.data || []).map(emp => ({
          ...emp,
          isActive: emp.is_active, // Map from snake_case to camelCase for consistency
        }));
        setEmployees(mappedEmployees);

        if (settingsRes.data) {
          setSettings({ general: settingsRes.data.general });
        } else {
          console.warn("No settings found in DB, using default. ", settingsRes.error);
        }

        if (receivablesRes.data) {
          setAccountsReceivable(receivablesRes.data.map((r: any) => ({
            ...r,
            customerName: r.customer_name,
            date: r.created_at // Keep ISO string format for proper date parsing
          })));
        }

        if (internalUseRes.data) {
          setInternalUseEntries(internalUseRes.data.map((i: any) => ({
            ...i,
            totalCost: i.total_cost,
            date: i.created_at // Keep ISO string format for proper date parsing
          })));
        }

        // --- FETCH ALL SALES (HISTORICAL) ---
        setLoadingStatus('Carregando histórico de vendas...');
        const { data: allSalesData, error: allSalesError } = await supabase
          .from('sales')
          .select('*, operator:operator_id(name), reverter:reversed_by(name), sale_items(*, products(name))')
          .order('created_at', { ascending: false });

        if (allSalesError) {
          console.error("Error fetching all sales:", allSalesError);
        } else if (allSalesData) {
          const mappedAllSales: CompletedSale[] = allSalesData.map((s: any) => ({
            id: s.id,
            cart: s.sale_items?.map((item: any) => ({
              id: item.product_id,
              name: item.products?.name || 'Produto Removido',
              quantity: Number(item.quantity),
              price: Number(item.unit_price),
              total: Number(item.quantity) * Number(item.unit_price)
            })) || [],
            subtotal: Number(s.subtotal),
            discount: Number(s.discount),
            total: Number(s.total),
            paymentMethod: s.status === 'completed' ? (s.payments?.[0]?.method || 'N/A') : 'N/A',
            amountPaid: Number(s.total),
            change: 0,
            date: s.created_at,
            operatorName: s.operator?.name || 'Operador',
            cashierNumber: s.cashier_number,
            status: s.status as any,
            payments: s.payments || [],
            cancellationReason: s.cancellation_reason,
            reversedBy: s.reverter?.name || s.reversed_by || undefined,
            reversedAt: s.reversed_at ? s.reversed_at : undefined
          }));
          setAllSales(mappedAllSales);

          // --- FETCH ALL CASHIER SESSIONS ---
          setLoadingStatus('Carregando registros de caixa...');
          const { data: allSessionsData, error: allSessionsError } = await supabase
            .from('cashier_sessions')
            .select('*, employees(name)')
            .order('opened_at', { ascending: false })
            .limit(4); // Pegar os últimos 4 caixas para o dashboard

          if (allSessionsError) {
            console.error("Error fetching all cashier sessions:", allSessionsError);
          } else {
            setAllSessions(allSessionsData || []);
          }

          // --- FETCH OPEN CASHIER SESSION ---
          setLoadingStatus('Verificando sessão do caixa...');
          const { data: openSessionData, error: openSessionError } = await supabase
            .from('cashier_sessions')
            .select('*')
            .eq('status', 'open')
            .order('opened_at', { ascending: false })
            .maybeSingle();

          if (openSessionError) {
            console.error("Error fetching open cashier session:", openSessionError);
          } else if (openSessionData) {
            setCashierState({
              id: openSessionData.id,
              status: 'open',
              openingBalance: openSessionData.opening_balance,
              operatorName: openSessionData.operator_name || (loggedInUser?.name ?? 'Desconhecido'),
              openTime: new Date(openSessionData.opened_at).toLocaleString('pt-BR'),
              sessionSales: [],
              cashierNumber: openSessionData.cashier_number
            });

            // RECUPERAR VENDAS DA SESSÃO ATUAL (Filtramos das allSales pré-carregadas)
            const sessionSales = allSalesData?.filter((s: any) => s.cashier_session_id === openSessionData.id)
              .map((s: any) => {
                const found = mappedAllSales.find(ms => ms.id === s.id);
                return found;
              }).filter(Boolean) as CompletedSale[];
            setCurrentSessionSales(sessionSales);
          } else {
            setCashierState(prev => ({ ...prev, status: 'closed' }));
          }
          // ----------------------------------
        } // This closes the `else if (allSalesData)` block
      } catch (error: any) { // This catch is for the main try block that starts with `setLoadingStatus('Carregando dados principais...');`
        console.error("Error fetching initial data:", error);
        alert(`Erro ao carregar dados do sistema: ${error.message}`);
      } finally {
        setDataLoading(false);
        setLoadingStatus('Carregamento concluído.');
      }
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchInitialData();

    // --- REAL-TIME SUBSCRIPTIONS ---
    const channels = [
      supabase.channel('dashboard-sales').on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchInitialData()),
      supabase.channel('dashboard-products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchInitialData()),
      supabase.channel('dashboard-internal-use').on('postgres_changes', { event: '*', schema: 'public', table: 'internal_use' }, () => fetchInitialData()),
      supabase.channel('dashboard-receivables').on('postgres_changes', { event: '*', schema: 'public', table: 'receivables' }, () => fetchInitialData()),
      supabase.channel('dashboard-sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'cashier_sessions' }, () => fetchInitialData()),
      supabase.channel('dashboard-categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchInitialData()),
      supabase.channel('dashboard-units').on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => fetchInitialData()),
      supabase.channel('dashboard-customers').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchInitialData()),
      supabase.channel('dashboard-employees').on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => fetchInitialData()),
      supabase.channel('dashboard-settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchInitialData())
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [loggedInUser, fetchInitialData]);

  const { data: dashboardData, loading: dashboardLoading } = useDashboardData(allSales, products, internalUseEntries, settings, allSessions);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
      alert(`Erro ao tentar sair do sistema: ${error.message}`);
      return;
    }

    // Explicitamente define o usuário como nulo para forçar a tela de login
    setLoggedInUser(null);

    // Limpa todos os outros estados para garantir um logout limpo e evitar
    // que dados da sessão anterior "pisquem" na tela para o próximo usuário.
    setCurrentSessionSales([]);
    setAccountsReceivable([]);
    setInternalUseEntries([]);
    setCashierState({ id: 1, status: 'closed', cashierNumber: 1 });
    setProducts([]);
    setCustomers([]);
    setCategories([]);
    setUnits([]);
    setEmployees([]);
    setSettings({
      general: {
        companyName: 'Carregando...', tradingName: 'SKYMiniMercado', cnpj: '', address: '', logoUrl: '',
        timezone: 'America/Sao_Paulo', language: 'pt-BR', currency: 'BRL', autoDateTime: true, dailySalesGoal: 0,
      }
    });

    // Redefine a tela para um padrão, embora o redirecionamento para o login seja a ação principal.
    setCurrentScreen('pos');
  };

  const handleOpenCashier = async (details: { openingBalance: number; operatorName: string; }) => {
    try {
      const { data, error } = await supabase
        .from('cashier_sessions')
        .insert({
          operator_id: loggedInUser?.id, // Assumes loggedInUser is set
          opening_balance: details.openingBalance,
          operator_name: details.operatorName,
          status: 'open',
          opened_at: new Date().toISOString(),
          cashier_number: 1 // Default to 1 for now
        })
        .select()
        .single();

      if (error) {
        console.error("Error opening cashier session in DB:", error);
        alert(`Erro ao salvar abertura de caixa no banco de dados: ${error.message}`);
        return;
      }

      if (data) {
        setCashierState({
          id: data.id, // Use the DB ID
          status: 'open',
          openingBalance: details.openingBalance,
          operatorName: details.operatorName,
          openTime: new Date(data.opened_at).toLocaleString('pt-BR'),
          sessionSales: [],
          cashierNumber: data.cashier_number
        });
        setCurrentSessionSales([]);
        alert('Caixa aberto com sucesso!');
      }
    } catch (e: any) {
      console.error("Unexpected error opening cashier:", e);
      alert(`Erro inesperado ao abrir caixa: ${e.message}`);
    }
  };

  const handleCloseCashier = async () => {
    if (cashierState.status !== 'open') return;

    try {
      const { error } = await supabase
        .from('cashier_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', cashierState.id);

      if (error) {
        console.error("Error closing cashier session in DB:", error);
        alert(`Erro ao fechar caixa no banco de dados: ${error.message}`);
        // Deciding whether to proceed locally or not. Let's block to ensure consistency.
        return;
      }

      setCashierState({ ...cashierState, status: 'closed' });
      setCurrentSessionSales([]);
      alert('Caixa fechado com sucesso!');

    } catch (e: any) {
      console.error("Unexpected error closing cashier:", e);
      alert(`Erro inesperado ao fechar caixa: ${e.message}`);
    }
  };

  const handleSaleComplete = async (saleData: Omit<CompletedSale, 'id'>) => {
    try {
      // 1. SALVAR VENDA NO BANCO DE DADOS
      const { data: savedSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          operator_id: loggedInUser?.id,
          cashier_number: cashierState.cashierNumber,
          cashier_session_id: cashierState.id,
          subtotal: saleData.subtotal,
          discount: saleData.discount,
          total: saleData.total,
          payments: saleData.payments || [{ method: saleData.paymentMethod, amount: saleData.total }],
          status: 'completed'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 1.1 SALVAR ITENS DA VENDA
      const saleItemsToInsert = saleData.cart.map(item => ({
        sale_id: savedSale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsToInsert);

      if (itemsError) {
        console.error("Error saving sale items:", itemsError);
        // We proceed even if items fail, but log it. Ideally we should use a transaction or RPC.
      }

      // 2. ATUALIZAR ESTOQUE E TOTAL VENDIDO NO BANCO DE DADOS
      const productUpdatePromises = saleData.cart.map(async (item) => {
        const productInState = products.find(p => p.id === item.id);
        if (!productInState) throw new Error(`Produto ID ${item.id} não encontrado.`);
        const newStock = productInState.stock_quantity - item.quantity;
        const newTotalSold = (productInState.total_sold || 0) + item.quantity;

        // Gatilho para lista de compra: se estoque <= mínimo após venda
        const onShoppingList = newStock <= productInState.min_stock_alert;

        const updatePayload: any = {
          stock_quantity: newStock,
          total_sold: newTotalSold
        };

        // Só tenta atualizar on_shopping_list se o campo existir ou confiamos que o usuário rodará o SQL
        updatePayload.on_shopping_list = onShoppingList;

        const { error: updateError } = await supabase.from('products').update(updatePayload).eq('id', item.id);

        if (updateError) {
          console.error(`Erro ao atualizar produto ${item.name} (estoque/lista):`, updateError);
          // Se o erro for de coluna inexistente, tentamos sem ela para não bloquear a conclusão da venda
          if (updateError.message.includes('on_shopping_list')) {
            console.warn("Retrying update without 'on_shopping_list' column...");
            delete updatePayload.on_shopping_list;
            await supabase.from('products').update(updatePayload).eq('id', item.id);
          }
        }
      });
      await Promise.all(productUpdatePromises);

      // 3. ATUALIZAR ESTADO LOCAL
      const newSale: CompletedSale = {
        ...saleData,
        id: savedSale.id,
      };

      setCurrentSessionSales(prev => [...prev, newSale]);
      setAllSales(prev => [newSale, ...prev]);

      setProducts(currentProducts => {
        return currentProducts.map(p => {
          const soldItem = saleData.cart.find(item => item.id === p.id);
          if (soldItem) {
            const newStock = p.stock_quantity - soldItem.quantity;
            return {
              ...p,
              stock_quantity: newStock,
              total_sold: (p.total_sold || 0) + soldItem.quantity,
              on_shopping_list: newStock <= p.min_stock_alert
            };
          }
          return p;
        });
      });

    } catch (error: any) {
      console.error("Sale completion failed:", error);
      alert(`Erro ao processar venda: ${error.message}`);
    }
  };


  const handleReverseCompletedSale = async (saleId: number, reason: string) => {
    const saleToReverse = currentSessionSales.find(s => s.id === saleId);
    if (!saleToReverse || saleToReverse.status !== 'completed') {
      alert('Apenas vendas concluídas podem ser estornadas.');
      return;
    }

    try {
      // 1. ATUALIZAR STATUS NO BANCO DE DADOS
      const { error: saleError } = await supabase
        .from('sales')
        .update({
          status: 'reversed',
          cancellation_reason: reason,
          reversed_by: loggedInUser!.id,
          reversed_at: new Date().toISOString()
        })
        .eq('id', saleId);

      if (saleError) throw saleError;

      // 2. ATUALIZAR ESTOQUE E TOTAL VENDIDO NO BANCO DE DADOS
      const productUpdatePromises = saleToReverse.cart.map(item => {
        const productInState = products.find(p => p.id === item.id);
        if (!productInState) throw new Error(`Produto ID ${item.id} não encontrado.`);
        const newStock = productInState.stock_quantity + item.quantity;
        const newTotalSold = Math.max(0, (productInState.total_sold || 0) - item.quantity);
        return supabase.from('products').update({
          stock_quantity: newStock,
          total_sold: newTotalSold
        }).eq('id', item.id);
      });
      await Promise.all(productUpdatePromises);

      setProducts(currentProducts => {
        return currentProducts.map(p => {
          const returnedItem = saleToReverse.cart.find(item => item.id === p.id);
          if (returnedItem) {
            return {
              ...p,
              stock_quantity: p.stock_quantity + returnedItem.quantity,
              total_sold: Math.max(0, (p.total_sold || 0) - returnedItem.quantity)
            };
          }
          return p;
        });
      });

      const updatedSale = { ...saleToReverse, status: 'reversed' as const, cancellationReason: reason, reversedBy: loggedInUser!.name, reversedAt: new Date().toISOString() };

      setCurrentSessionSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));
      setAllSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));

      alert(`Venda #${saleId} estornada com sucesso. Motivo: ${reason}.`);
    } catch (error: any) {
      console.error("Stock reversal failed:", error);
      alert(`Erro ao estornar estoque: ${error.message}. A venda não foi estornada. Ajuste manualmente se necessário.`);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    let { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .maybeSingle();

    if (error && error.message.includes('column') && error.message.includes('not found')) {
      const match = error.message.match(/'([^']+)'/);
      if (match && match[1]) {
        const missingColumn = match[1];
        console.warn(`Column '${missingColumn}' not found in DB. Retrying insert without it...`);
        const { [missingColumn]: _, ...sanitizedProduct } = newProduct as any;
        const retry = await supabase
          .from('products')
          .insert(sanitizedProduct)
          .select()
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }
    }

    if (data) {
      setProducts(prevProducts => [...prevProducts, data]);
    } else {
      console.error("Error adding product:", error);
      if (error?.message?.includes('products_barcode_key')) {
        // Attempt to fetch the existing product to show its name
        const { data: existingProduct } = await supabase
          .from('products')
          .select('name')
          .eq('barcode', newProduct.barcode)
          .maybeSingle();

        if (existingProduct) {
          alert(`Erro: Já existe um produto cadastrado com este código de barras.\n\nCódigo: ${newProduct.barcode}\nNome do Produto encontrado: ${existingProduct.name}\n\nVerifique se ele está inativo ou na lista.`);
        } else {
          alert(`Erro: Já existe um produto cadastrado com este código de barras (${newProduct.barcode}) no banco de dados (mas não foi possível ler o nome por permissão).`);
        }
      } else {
        alert(`Erro ao adicionar produto: ${error?.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { id, created_at, ...updateData } = updatedProduct;

    // Auto-remover da lista se o estoque for atualizado para > mínimo
    if (updateData.stock_quantity > updateData.min_stock_alert) {
      updateData.on_shopping_list = false;
    }

    let { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    // Loop de retry genérico para colunas não encontradas
    let currentUpdateData = { ...updateData };
    while (error && error.message.includes('column') && error.message.includes('not found')) {
      const match = error.message.match(/'([^']+)'/);
      if (match && match[1]) {
        const missingColumn = match[1];
        console.warn(`Column '${missingColumn}' not found in DB. Retrying update without it...`);
        const { [missingColumn]: _, ...nextUpdateData } = currentUpdateData as any;
        currentUpdateData = nextUpdateData;
        const retry = await supabase
          .from('products')
          .update(currentUpdateData)
          .eq('id', id)
          .select()
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      } else {
        break; // Não conseguiu extrair o nome da coluna
      }
    }

    if (data) {
      setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? data : p));
      alert('Produto atualizado com sucesso!');
    } else {
      console.error("Error updating product:", error);
      alert(`Erro ao atualizar produto: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } else {
      console.error("Error deleting product:", error);
      alert('Erro ao excluir produto.');
    }
  };

  const handleForceDeleteProduct = async (barcode: string) => {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('barcode', barcode.trim())
      .select(); // Supabase delete returns the deleted rows if select() is chained

    if (error) throw error;

    if (!data || data.length === 0) {
      alert(`Nenhum produto encontrado com o código "${barcode}". Verifique se digitou corretamente.`);
      return false;
    }

    // Update local state by removing products with this barcode
    setProducts(prev => prev.filter(p => p.barcode !== barcode));
    return true;
  };

  const handleImportProducts = async (importedProducts: Omit<Product, 'id'>[]) => {
    if (!importedProducts || importedProducts.length === 0) {
      setToast({ message: 'Nenhum produto para importar.', type: 'error' });
      return;
    }

    setToast({ message: 'Importando produtos...', type: 'info' });

    const { data, error } = await supabase
      .from('products')
      .upsert(importedProducts, { onConflict: 'barcode' })
      .select();

    if (error) {
      console.error("Error importing products:", error);
      setToast({ message: `Erro ao importar: ${error.message}`, type: 'error' });
      return;
    }

    if (data) {
      try {
        setToast({ message: 'Produtos importados com sucesso! Atualizando...', type: 'success' });
        const refreshedProducts = await fetchAllProductsInChunks();
        setProducts(refreshedProducts || []);
      } catch (refreshError: any) {
        console.error("Error refreshing products:", refreshError);
        setToast({ message: `Importado, mas erro ao atualizar lista: ${refreshError.message}`, type: 'warning' });
      }
    }
  };


  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
    if (data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setToast({ message: 'Categoria adicionada com sucesso!', type: 'success' });
    } else {
      console.error("Error adding category:", error);
      setToast({ message: `Erro ao adicionar categoria: ${error?.message}`, type: 'error' });
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: updatedCategory.name })
      .eq('id', updatedCategory.id)
      .select()
      .single();

    if (data) {
      setCategories(prev => prev.map(c => c.id === data.id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
      setToast({ message: 'Categoria atualizada com sucesso!', type: 'success' });
    } else {
      console.error("Error updating category:", error);
      setToast({ message: `Erro ao atualizar categoria: ${error?.message}`, type: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) {
      console.error("Error checking for associated products:", countError);
      setToast({ message: 'Erro ao verificar produtos associados.', type: 'error' });
      return;
    }

    if (count !== null && count > 0) {
      setToast({ message: `Não é possível excluir: ${count} produto(s) estão associados a esta categoria.`, type: 'error' });
      return;
    }

    const { error: deleteError } = await supabase.from('categories').delete().eq('id', categoryId);

    if (!deleteError) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setToast({ message: 'Categoria excluída com sucesso!', type: 'success' });
    } else {
      console.error("Error deleting category:", deleteError);
      setToast({ message: `Erro ao excluir categoria: ${deleteError.message}`, type: 'error' });
    }
  };


  const handleAddUnit = async (newUnit: Omit<Unit, 'id'>) => {
    const { data, error } = await supabase.from('units').insert(newUnit).select().single();
    if (data) {
      setUnits(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setToast({ message: 'Unidade adicionada com sucesso!', type: 'success' });
    } else {
      console.error("Error adding unit:", error);
      setToast({ message: `Erro ao adicionar unidade: ${error?.message}`, type: 'error' });
    }
  };

  const handleUpdateUnit = async (updatedUnit: Unit) => {
    const { data, error } = await supabase
      .from('units')
      .update({ name: updatedUnit.name, abbreviation: updatedUnit.abbreviation })
      .eq('id', updatedUnit.id)
      .select()
      .single();

    if (data) {
      setUnits(prev => prev.map(u => u.id === data.id ? data : u).sort((a, b) => a.name.localeCompare(b.name)));
      setToast({ message: 'Unidade atualizada com sucesso!', type: 'success' });
    } else {
      console.error("Error updating unit:", error);
      setToast({ message: `Erro ao atualizar unidade: ${error?.message}`, type: 'error' });
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('unit_id', unitId);

    if (countError) {
      console.error("Error checking for associated products:", countError);
      setToast({ message: 'Erro ao verificar produtos associados.', type: 'error' });
      return;
    }

    if (count !== null && count > 0) {
      setToast({ message: `Não é possível excluir: ${count} produto(s) estão associados a esta unidade.`, type: 'error' });
      return;
    }

    const { error: deleteError } = await supabase.from('units').delete().eq('id', unitId);

    if (!deleteError) {
      setUnits(prev => prev.filter(u => u.id !== unitId));
      setToast({ message: 'Unidade excluída com sucesso!', type: 'success' });
    } else {
      console.error("Error deleting unit:", deleteError);
      setToast({ message: `Erro ao excluir unidade: ${deleteError.message}`, type: 'error' });
    }
  };

  const handleAddCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    const { data, error } = await supabase.from('customers').insert(newCustomer).select().single();
    if (data) setCustomers(prev => [...prev, data]);
    else {
      console.error("Error adding customer:", error);
      alert(`Erro ao adicionar cliente: ${error?.message}`);
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const { id, ...updateData } = updatedCustomer;
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (data) {
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
    } else {
      console.error("Error updating customer:", error);
      alert(`Erro ao atualizar cliente: ${error?.message}`);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (!error) setCustomers(prev => prev.filter(c => c.id !== customerId));
    else {
      console.error("Error deleting customer:", error);
      alert(`Erro ao excluir cliente: ${error?.message}`);
    }
  };

  const handleAddEmployee = async (newEmployeeData: Omit<Employee, 'id'>, password: string) => {
    const { data: { session: adminSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !adminSession) {
      alert('Erro: Sessão do administrador não encontrada. Não é possível criar um novo usuário.');
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmployeeData.email!,
      password: password,
    });

    if (signUpError) {
      alert(`Erro ao criar novo funcionário: ${signUpError.message}`);
      await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
      return;
    }

    if (!signUpData.user) {
      alert('Erro inesperado: O usuário não foi criado.');
      await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
      return;
    }

    const employeeProfile = {
      id: signUpData.user.id,
      name: newEmployeeData.name,
      role: newEmployeeData.role,
      is_active: newEmployeeData.isActive,
      permissions: newEmployeeData.permissions,
    };

    const { data: profileData, error: profileError } = await supabase
      .from('employees')
      .insert(employeeProfile)
      .select()
      .single();

    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });

    if (setSessionError) {
      alert('Funcionário criado, mas ocorreu um erro ao restaurar sua sessão. Por favor, faça login novamente.');
      return;
    }

    if (profileError) {
      alert(`Usuário de autenticação criado, mas falha ao salvar perfil: ${profileError.message}. Contate o suporte.`);
      return;
    }

    if (profileData) {
      const newEmployee: Employee = {
        id: profileData.id,
        email: newEmployeeData.email,
        name: profileData.name,
        role: profileData.role,
        isActive: profileData.is_active,
        permissions: profileData.permissions,
      };
      setEmployees(prev => [...prev, newEmployee].sort((a, b) => a.name.localeCompare(b.name)));
      alert('Funcionário cadastrado com sucesso!');
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    const { id, email, isActive, ...rest } = updatedEmployee;

    const updatePayload = {
      ...rest,
      is_active: isActive,
    };

    const { data, error } = await supabase
      .from('employees')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (data) {
      const updatedEmployeeInState: Employee = {
        ...updatedEmployee, // keep original properties like email
        ...data, // overwrite with db values
        isActive: data.is_active, // map snake_case to camelCase
      };
      setEmployees(prev => prev.map(e => e.id === id ? updatedEmployeeInState : e));
    } else {
      console.error("Error updating employee:", error);
      alert(`Erro ao atualizar funcionário: ${error?.message}`);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    // NOTA: Em uma implementação real com Supabase, a exclusão de um usuário
    // deve ser tratada através de uma Edge Function segura que chama
    // `supabase.auth.admin.deleteUser()`. Este mock simula uma exclusão
    // direta na tabela para manter a consistência da UI.
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (!error) {
      setEmployees(prev => prev.filter(e => e.id !== employeeId));
    } else {
      console.error("Error deleting employee:", error);
      alert(`Erro ao excluir funcionário: ${error.message}`);
    }
  };

  const handleCancelSale = async (cart: CartItem[], total: number) => {
    try {
      const { data: savedSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          operator_id: loggedInUser?.id,
          cashier_number: cashierState.cashierNumber,
          cashier_session_id: cashierState.id,
          subtotal: total,
          discount: 0,
          total: total,
          payments: [],
          status: 'cancelled'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const newSale: CompletedSale = {
        id: savedSale.id,
        cart, subtotal: total, discount: 0, total, paymentMethod: 'N/A', amountPaid: 0, change: 0,
        date: savedSale.created_at, operatorName: loggedInUser!.name,
        cashierNumber: cashierState.cashierNumber!, status: 'cancelled', payments: [],
      };

      setCurrentSessionSales(prev => [...prev, newSale]);
      setAllSales(prev => [newSale, ...prev]);
      alert('Venda cancelada e registrada com sucesso.');
    } catch (error: any) {
      console.error("Error saving cancelled sale:", error);
      alert(`Erro ao registrar cancelamento: ${error.message}`);
    }
  };
  const handleFiadoSale = async (cart: CartItem[], customerName: string, discount: number = 0) => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const finalTotal = subtotal - discount;

    try {
      // 1. SALVAR VENDA NO HISTÓRICO (TABELA SALES)
      const { data: savedSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          operator_id: loggedInUser?.id,
          cashier_number: cashierState.cashierNumber,
          cashier_session_id: cashierState.id,
          subtotal,
          discount,
          total: finalTotal,
          payments: [{ method: 'Fiado', amount: finalTotal }],
          status: 'completed'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 1.1 SALVAR ITENS DA VENDA
      const saleItemsToInsert = cart.map(item => ({
        sale_id: savedSale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));
      const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

      if (itemsError) {
        console.error("Error saving fiado sale items:", itemsError);
      }

      // 2. SALVAR RECORDE EM CONTAS A RECEBER
      const { data: savedReceivable, error: receivableError } = await supabase
        .from('receivables')
        .insert({
          customer_name: customerName,
          cart: cart,
          subtotal,
          discount,
          total: finalTotal
        })
        .select()
        .single();

      if (receivableError) throw receivableError;

      const newReceivable: ReceivableEntry = {
        ...savedReceivable,
        customerName: savedReceivable.customer_name,
        date: savedReceivable.created_at,
      };
      setAccountsReceivable(prev => [newReceivable, ...prev]);

      const newSale: CompletedSale = {
        id: savedSale.id,
        cart,
        subtotal,
        discount,
        total: finalTotal,
        paymentMethod: 'Fiado',
        amountPaid: 0,
        change: 0,
        date: savedSale.created_at,
        operatorName: loggedInUser!.name,
        cashierNumber: cashierState.cashierNumber!,
        status: 'completed',
        payments: [{ method: 'Fiado', amount: finalTotal }],
      };

      setCurrentSessionSales(prev => [...prev, newSale]);
      setAllSales(prev => [newSale, ...prev]);

      // 3. ATUALIZAR ESTOQUE
      const stockUpdatePromises = cart.map(item => {
        const productInState = products.find(p => p.id === item.id);
        if (!productInState) throw new Error(`Produto ID ${item.id} não encontrado.`);
        const newStock = productInState.stock_quantity - item.quantity;
        const onShoppingList = newStock <= productInState.min_stock_alert;
        const newTotalSold = (productInState.total_sold || 0) + item.quantity;
        return supabase.from('products').update({
          stock_quantity: newStock,
          total_sold: newTotalSold,
          on_shopping_list: onShoppingList
        }).eq('id', item.id);
      });
      await Promise.all(stockUpdatePromises);

      setProducts(currentProducts => {
        return currentProducts.map(p => {
          const soldItem = cart.find(item => item.id === p.id);
          if (soldItem) {
            const newStock = p.stock_quantity - soldItem.quantity;
            return {
              ...p,
              stock_quantity: newStock,
              total_sold: (p.total_sold || 0) + soldItem.quantity,
              on_shopping_list: newStock <= p.min_stock_alert
            };
          }
          return p;
        });
      });
    } catch (error: any) {
      console.error("Fiado sale failed:", error);
      alert(`Erro ao processar venda fiado: ${error.message}`);
    }
  };

  const handleInternalUse = async (cart: CartItem[]) => {
    const totalCost = cart.reduce((total, item) => total + item.cost_price * item.quantity, 0);
    try {
      const { data: savedInternal, error: internalError } = await supabase
        .from('internal_use')
        .insert({
          cart,
          total_cost: totalCost
        })
        .select()
        .single();

      if (internalError) throw internalError;

      const newInternalUseEntry: InternalUseEntry = {
        ...savedInternal,
        totalCost: savedInternal.total_cost,
        date: savedInternal.created_at,
      };
      setInternalUseEntries(prev => [newInternalUseEntry, ...prev]);

      const stockUpdatePromises = cart.map(item => {
        const productInState = products.find(p => p.id === item.id);
        if (!productInState) throw new Error(`Produto ID ${item.id} não encontrado.`);
        const newStock = productInState.stock_quantity - item.quantity;
        const onShoppingList = newStock <= productInState.min_stock_alert;
        return supabase.from('products').update({
          stock_quantity: newStock,
          on_shopping_list: onShoppingList
        }).eq('id', item.id);
      });
      await Promise.all(stockUpdatePromises);

      setProducts(currentProducts => {
        return currentProducts.map(p => {
          const soldItem = cart.find(item => item.id === p.id);
          if (soldItem) {
            const newStock = p.stock_quantity - soldItem.quantity;
            return {
              ...p,
              stock_quantity: newStock,
              on_shopping_list: newStock <= p.min_stock_alert
            };
          }
          return p;
        });
      });
    } catch (error: any) {
      console.error("Internal use update failed:", error);
      alert(`Uso interno registrado localmente, mas erro ao salvar no banco ou atualizar estoque: ${error.message}.`);
    }
  };
  const handlePayReceivable = async (receivableId: number, paymentMethod: PaymentMethod) => {
    const receivable = accountsReceivable.find(r => r.id === receivableId);
    if (receivable) {
      try {
        // 1. REGISTRAR PAGAMENTO NO CAIXA (TABELA SALES)
        const { data: savedSale, error: saleError } = await supabase
          .from('sales')
          .insert({
            operator_id: loggedInUser?.id,
            cashier_number: cashierState.cashierNumber,
            cashier_session_id: cashierState.id,
            subtotal: receivable.subtotal || receivable.total,
            discount: receivable.discount || 0,
            total: receivable.total,
            payments: [{ method: paymentMethod, amount: receivable.total }],
            status: 'completed'
          })
          .select()
          .single();

        if (saleError) throw saleError;

        // 1.1 REGISTRAR ITENS DA VENDA
        const saleItemsToInsert = receivable.cart.map(item => ({
          sale_id: savedSale.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }));
        const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

        if (itemsError) {
          console.error("Error saving paid receivable items:", itemsError);
        }

        // 2. EXCLUIR RECEBÍVEL DO BANCO
        const { error: deleteError } = await supabase
          .from('receivables')
          .delete()
          .eq('id', receivableId);

        if (deleteError) throw deleteError;

        const newSale: CompletedSale = {
          id: savedSale.id,
          cart: receivable.cart,
          subtotal: receivable.subtotal ?? receivable.total,
          discount: receivable.discount ?? 0,
          total: receivable.total,
          paymentMethod: paymentMethod,
          amountPaid: receivable.total,
          change: 0,
          date: savedSale.created_at,
          operatorName: loggedInUser!.name,
          cashierNumber: cashierState.cashierNumber!,
          status: 'completed',
          payments: [{ method: paymentMethod, amount: receivable.total }],
        };

        setCurrentSessionSales(prev => [...prev, newSale]);
        setAllSales(prev => [newSale, ...prev]);
        setAccountsReceivable(prev => prev.filter(r => r.id !== receivableId));
        alert('Pagamento da conta recebido e registrado no caixa com sucesso!');
      } catch (error: any) {
        console.error("Error paying receivable:", error);
        alert(`Erro ao processar pagamento: ${error.message}`);
      }
    }
  };

  const handleDeleteReceivable = async (receivableId: number) => {
    try {
      const { error } = await supabase
        .from('receivables')
        .delete()
        .eq('id', receivableId);

      if (error) throw error;

      setAccountsReceivable(prev => prev.filter(r => r.id !== receivableId));
      setToast({ message: 'Conta a receber excluída com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error("Error deleting receivable:", error);
      alert(`Erro ao excluir conta a receber: ${error.message}`);
    }
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ id: 1, general: newSettings.general })
        .select()
        .single();

      if (data) {
        setSettings({ general: data.general });
        alert('Configurações salvas com sucesso!');
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      alert(`Erro ao salvar configurações: ${error?.message}`);
    }
  };

  const handleClearShoppingList = async () => {
    try {
      const idsOnList = products.filter(p => p.on_shopping_list).map(p => p.id);
      if (idsOnList.length === 0) return;

      const { error } = await supabase
        .from('products')
        .update({ on_shopping_list: false })
        .in('id', idsOnList);

      if (error) throw error;

      setProducts(prev => prev.map(p => ({ ...p, on_shopping_list: false })));
      setToast({ message: 'Lista de compra zerada com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error("Error clearing shopping list:", error);
      alert(`Erro ao zerar lista de compra: ${error.message}`);
    }
  };

  if (authLoading || (loggedInUser && dataLoading) || connectionError) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-6 p-4">
        {!connectionError && <LoadingSpinner />}
        <p className={`text-center ${connectionError ? 'text-red-400 text-xl font-bold' : 'text-gray-400 animate-pulse'}`}>
          {connectionError || loadingStatus || 'Conectando ao sistema...'}
        </p>

        {connectionError && (
          <div className="flex flex-col space-y-4">
            <button
              onClick={async () => {
                setConnectionError(null);
                setLoadingStatus("Saindo...");
                localStorage.clear(); // Force clear local storage
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
            >
              Forçar Logout e Recarregar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isResettingPassword) {
    return <PasswordResetScreen onResetComplete={() => setIsResettingPassword(false)} />;
  }

  if (!loggedInUser) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen
          loggedInUser={loggedInUser}
          data={dashboardData}
          loading={dashboardLoading}
          onReverseCompletedSale={handleReverseCompletedSale}
        />;
      case 'pos':
        return <PosScreen
          loggedInUser={loggedInUser} cashierState={cashierState} products={products} customers={customers}
          onFiadoSale={handleFiadoSale} onInternalUse={handleInternalUse}
          onSaleComplete={handleSaleComplete} onCancelSale={handleCancelSale}
        />;
      case 'sales':
        return <SalesScreen sales={allSales} loggedInUser={loggedInUser} onReverseCompletedSale={handleReverseCompletedSale} />;
      case 'cashier':
        return <CashierScreen
          cashierState={{ ...cashierState, sessionSales: currentSessionSales }} onOpenCashier={handleOpenCashier}
          onCloseCashier={handleCloseCashier} employees={employees} loggedInUser={loggedInUser}
          settings={settings}
          allSales={allSales}
        />;
      case 'products':
        return <ProductManagementScreen
          products={products} categories={categories} units={units} onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onImportProducts={handleImportProducts}
        />;
      case 'stock': return <StockScreen products={products} />;
      case 'categories': return <CategoryManagementScreen
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />;
      case 'units': return <UnitManagementScreen
        units={units}
        onAddUnit={handleAddUnit}
        onUpdateUnit={handleUpdateUnit}
        onDeleteUnit={handleDeleteUnit}
      />;
      case 'customers':
        return <CustomerManagementScreen
          customers={customers} onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer}
        />;
      case 'employees':
        return <EmployeeManagementScreen
          employees={employees} onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee}
        />;
      case 'receivables': return <AccountsReceivableScreen receivables={accountsReceivable} onPayReceivable={handlePayReceivable} onDeleteReceivable={handleDeleteReceivable} />;
      case 'internalUse': return <InternalUseScreen entries={internalUseEntries} />;
      case 'shoppingList': return <ShoppingListScreen products={products} onClear={handleClearShoppingList} onUpdateProduct={handleUpdateProduct} />;
      case 'settings': return <SettingsScreen settings={settings} onSave={handleUpdateSettings} />;
      default:
        return <PosScreen
          loggedInUser={loggedInUser} cashierState={cashierState} products={products} customers={customers}
          onFiadoSale={handleFiadoSale} onInternalUse={handleInternalUse}
          onSaleComplete={handleSaleComplete} onCancelSale={handleCancelSale}
        />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
        <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <GlobalHeader
            cashierState={cashierState}
            alerts={dashboardData?.alerts || []}
            onBellClick={() => setIsNotificationsOpen(true)}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto">
            {renderScreen()}
          </main>
        </div>
      </div>
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={dashboardData?.alerts || []}
      />
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default App;
