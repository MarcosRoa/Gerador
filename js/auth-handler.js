// ============================================
// AUTH-HANDLER.js - Processamento de login (FASE E - API INTEGRADA)
// ============================================

async function processarLogin(user) {
    if (window.processandoLogin) {
        console.log('⏳ Login já sendo processado...');
        return;
    }
    
    if (window.isAdminUser && window.isAdminUser()) return;
    
    window.processandoLogin = true;
    
    try {
        console.log('🔐 Processando login para:', user.email);
        
        window.usuarioAtual = { 
            uid: user.uid, 
            nome: user.displayName || user.email?.split('@')[0] || 'Usuário', 
            email: user.email, 
            foto: user.photoURL, 
            isAdmin: false 
        };
        
        // ============================================
        // USAR API EM VEZ DE SUPABASE DIRETO
        // ============================================
        
        // Buscar créditos via API
        const credits = await window.apiClient.getCredits();
        window.creditosUsuario = credits;
        
        // Buscar status PRO via API
        const proStatus = await window.apiClient.getProStatus();
        window.isUserPro = proStatus.isPro;
        window.proDiasRestantes = proStatus.daysLeft || 0;
        
        console.log(`📋 Usuário: ${user.email} | PRO: ${window.isUserPro} | Créditos: ${window.creditosUsuario}`);
        
        window.usuarioAtual.isPro = window.isUserPro;
        window.usuarioAtual.proExpiresAt = window.proExpiresAt;
        window.usuarioAtual.proDiasRestantes = window.proDiasRestantes;
        
        // Expor variáveis globalmente
        window.isUserPro = window.isUserPro;
        window.usuarioAtual = window.usuarioAtual;
        window.creditosUsuario = window.creditosUsuario;
        
        if (typeof window.carregarConfiguracoesUsuario === 'function') {
            window.carregarConfiguracoesUsuario();
        }
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            await window.atualizarInterfaceUsuario();
        }
        
        const proMsg = window.isUserPro ? ` ⭐ PRO` : '';
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`Bem-vindo ${window.usuarioAtual.nome}! Saldo: R$ ${window.creditosUsuario}${proMsg}`, 'success');
        }
        
        setTimeout(() => {
            if (typeof window.renderizarConteudo === 'function') {
                const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
                window.renderizarConteudo(loteria);
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro no processarLogin:', error);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Erro ao processar login', 'error');
        }
    } finally {
        window.processandoLogin = false;
    }
}

window.processarLogin = processarLogin;

console.log('✅ AUTH-HANDLER.js atualizado (FASE E - API integrada)');
