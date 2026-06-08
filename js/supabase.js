// ============================================
// SUPABASE.js - Funções de banco de dados (FASE 19)
// ============================================

function checkSupabase() {
    if (!window.supabaseClient) {
        console.error('❌ Supabase não inicializado');
        return false;
    }
    return true;
}

async function salvarTransacaoSupabase(uid, transacao) {
    if (!checkSupabase()) return;
    try {
        const { error } = await window.supabaseClient.from('transacoes').insert({
            usuario_uid: uid, 
            tipo: transacao.tipo, 
            quantidade: transacao.quantidade,
            saldo_apos: transacao.saldo, 
            data: new Date()
        });
        if (error) throw error;
        console.log('✅ Transação salva:', transacao.tipo, 'R$', transacao.quantidade);
    } catch (error) { 
        console.error('❌ Erro ao salvar transação:', error); 
    }
}

async function carregarCreditosSupabase(uid) {
    if (!checkSupabase()) return 5;
    try {
        let { data, error } = await window.supabaseClient
            .from('usuarios')
            .select('creditos')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
            const nome = window.usuarioAtual?.nome || 'Usuário';
            const email = window.usuarioAtual?.email || '';
            
            const { data: newUser, error: insertError } = await window.supabaseClient
                .from('usuarios')
                .insert({ 
                    uid: uid, 
                    nome: nome, 
                    email: email, 
                    creditos: 5, 
                    created_at: new Date(), 
                    updated_at: new Date() 
                })
                .select('creditos')
                .single();
            
            if (insertError) {
                console.error('❌ Erro ao criar usuário:', insertError);
                return 5;
            }
            console.log('✅ Usuário criado com sucesso! Saldo: 5');
            return 5;
        }
        return data.creditos || 5;
    } catch (error) { 
        console.error('Erro:', error); 
        return 5; 
    }
}

async function salvarCreditoSupabase(uid, novoSaldo) {
    if (!checkSupabase()) return;
    try {
        const { error } = await window.supabaseClient
            .from('usuarios')
            .update({ creditos: novoSaldo, updated_at: new Date() })
            .eq('uid', uid);
        if (error) throw error;
        console.log('✅ Créditos salvos:', novoSaldo);
    } catch (error) { 
        console.error('❌ Erro ao salvar créditos:', error); 
    }
}

async function salvarHistoricoSupabase(uid, loteria, jogos, filtros, extras, meses = null, quantidadeNumeros = null, times = null) {
    if (!checkSupabase()) return;
    if (!uid) return;
    
    try {
        const insertData = { 
            usuario_uid: uid, 
            loteria: loteria, 
            jogos: jogos, 
            filtros: filtros, 
            extras: extras, 
            data: new Date()
        };
        
        if (meses && Array.isArray(meses) && meses.length > 0) insertData.meses = meses;
        if (quantidadeNumeros && quantidadeNumeros > 0) insertData.quantidade_numeros = quantidadeNumeros;
        if (times && Array.isArray(times) && times.length > 0) insertData.times = times;
        
        const { error } = await window.supabaseClient
            .from('historico_palpites')
            .insert(insertData);
        
        if (error) throw error;
        console.log('✅ Histórico salvo!');
        
    } catch (error) { 
        console.error('❌ Erro ao salvar histórico:', error); 
    }
}

async function carregarHistoricoSupabase(uid) {
    if (!checkSupabase()) return [];
    if (!uid) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', uid)
            .order('data', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        return data || [];
    } catch (error) { 
        console.error('Erro:', error); 
        return []; 
    }
}

async function carregarStatusPro(uid) {
    if (!checkSupabase()) return { isPro: false, expira_em: null, dias_restantes: 0 };
    try {
        const { data, error } = await window.supabaseClient
            .rpc('get_pro_status', { user_uid: uid });
        if (error) throw error;
        if (data && data.length > 0) {
            return {
                isPro: data[0].is_pro || false,
                expira_em: data[0].expira_em,
                dias_restantes: data[0].dias_restantes || 0
            };
        }
        return { isPro: false, expira_em: null, dias_restantes: 0 };
    } catch (error) {
        console.error('Erro ao carregar status PRO:', error);
        return { isPro: false, expira_em: null, dias_restantes: 0 };
    }
}

async function ativarProDB(uid, valorPagamento = 19.90, diasValidade = 15) {
    if (!checkSupabase()) return false;
    try {
        const { error } = await window.supabaseClient.rpc('ativar_pro', { 
            user_uid: uid, 
            valor_pagamento: valorPagamento, 
            dias_validade: diasValidade 
        });
        if (error) throw error;
        console.log(`✅ PRO ativado para ${uid}`);
        return true;
    } catch (error) { 
        console.error('Erro ao ativar PRO:', error); 
        return false; 
    }
}

async function limparDadosAntigos(uid) {
    if (!checkSupabase()) return 0;
    try {
        const { data, error } = await window.supabaseClient
            .rpc('limpar_historico_usuario', { user_uid: uid });
        if (error) throw error;
        console.log(`🗑️ Limpeza concluída: ${data || 0} registros removidos`);
        return data;
    } catch (error) {
        console.error('Erro na limpeza:', error);
        return 0;
    }
}

window.salvarTransacaoSupabase = salvarTransacaoSupabase;
window.carregarCreditosSupabase = carregarCreditosSupabase;
window.salvarCreditoSupabase = salvarCreditoSupabase;
window.salvarHistoricoSupabase = salvarHistoricoSupabase;
window.carregarHistoricoSupabase = carregarHistoricoSupabase;
window.carregarStatusPro = carregarStatusPro;
window.ativarProDB = ativarProDB;
window.limparDadosAntigos = limparDadosAntigos;
