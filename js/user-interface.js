// ============================================
// USER-INTERFACE.js - Interface do Usuário (FASE E - API INTEGRADA)
// ============================================

// ... (manter funções existentes)

async function buscarCreditosAPI() {
    try {
        const credits = await window.apiClient.getCredits();
        if (credits !== window.creditosUsuario) {
            window.creditosUsuario = credits;
        }
        return credits;
    } catch (error) {
        console.error('Erro ao buscar créditos via API:', error);
        return window.creditosUsuario || 0;
    }
}

async function atualizarInterfaceUsuario() {
    const loginArea = document.getElementById('loginArea');
    const userInfoArea = document.getElementById('userInfoArea');
    
    if (window.usuarioAtual) {
        if (loginArea) loginArea.style.display = 'none';
        if (userInfoArea) {
            userInfoArea.style.display = 'flex';
            userInfoArea.style.justifyContent = 'center';
            userInfoArea.style.alignItems = 'center';
            userInfoArea.style.gap = '12px';
            userInfoArea.style.flexWrap = 'wrap';
        }
        
        // Buscar créditos via API
        await buscarCreditosAPI();
        
        const avatarHtml = window.usuarioAtual.foto 
            ? `<img src="${window.usuarioAtual.foto}" class="user-avatar" alt="Avatar" style="object-fit: cover;">`
            : `<div class="user-avatar" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); display: flex; align-items: center; justify-content: center;">👤</div>`;
        
        const proBadgeHtml = window.isUserPro ? '<span class="pro-badge">⭐ PRO</span>' : '';
        const proExpiresHtml = window.isUserPro && window.proExpiresAt ? `<p class="pro-expires">✨ Válido até ${new Date(window.proExpiresAt).toLocaleDateString()}</p>` : '';
        
        if (userInfoArea) {
            userInfoArea.innerHTML = `
                <div class="user-info">
                    ${avatarHtml}
                    <div class="user-details">
                        <h4>${window.usuarioAtual.nome} ${proBadgeHtml}</h4>
                        ${proExpiresHtml}
                        <p>${window.usuarioAtual.email}</p>
                    </div>
                </div>
                <div class="credits-box" onclick="window.abrirPerfil()">
                    <span>💰 MEUS CRÉDITOS</span>
                    <strong id="creditosDisplay">R$ ${window.creditosUsuario || 0}</strong>
                </div>
                <button class="btn-comprar" onclick="window.abrirModalComprar()">➕ Comprar Créditos</button>
                ${!window.isUserPro ? '<button class="btn-pro" onclick="window.ativarPro()">⭐ ATIVAR PRO</button>' : ''}
                <button class="btn-perfil" onclick="window.abrirPerfil()">👤 Meu Perfil</button>
                <button class="btn-tema" onclick="window.toggleTema()">🌓 Tema</button>
                <span class="status-online">🟢 Online</span>
                <button class="btn-logout" onclick="window.logout()">🚪 Sair</button>
            `;
        }
    } else {
        if (loginArea) loginArea.style.display = 'block';
        if (userInfoArea) {
            userInfoArea.style.display = 'none';
            userInfoArea.innerHTML = '';
        }
    }
}

// Nova função para comprar créditos via API
async function comprarCreditos(valor) {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    try {
        const result = await window.apiClient.createPayment(valor);
        
        if (result.mode === 'simulation') {
            // Modo simulação: mostrar QR Code
            window.mostrarToast(`Simulação: R$ ${valor} adicionados!`, 'success');
            window.creditosUsuario += valor;
            await window.atualizarInterfaceUsuario();
        } else {
            // Modo real: redirecionar para pagamento
            if (result.paymentLink) {
                window.open(result.paymentLink, '_blank');
            }
        }
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        window.mostrarToast('Erro ao processar pagamento', 'error');
    }
}

// Substituir função antiga
window.simularPix = comprarCreditos;
window.buscarCreditosAPI = buscarCreditosAPI;

console.log('✅ USER-INTERFACE.js atualizado (FASE E)');
// ============================================
// FUNÇÃO ABRIR PERFIL
// ============================================
function abrirPerfil() {
    if (!window.usuarioAtual) {
        if (typeof window.mostrarModalLogin === 'function') {
            window.mostrarModalLogin();
        }
        return;
    }
    
    sessionStorage.setItem('perfil_usuario', JSON.stringify({
        uid: window.usuarioAtual.uid,
        nome: window.usuarioAtual.nome,
        email: window.usuarioAtual.email,
        foto: window.usuarioAtual.foto,
        creditos: window.creditosUsuario,
        isPro: window.isUserPro,
        proExpiresAt: window.proExpiresAt
    }));
    
    window.location.href = 'perfil.html';
}

// Garantir que está exportada
window.abrirPerfil = abrirPerfil;
