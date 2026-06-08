// ============================================
// UTILS.js - Funções auxiliares do sistema (FASE 19)
// ============================================

// ============================================
// MASCARAR CONFIGURAÇÕES
// ============================================
function mascararConfiguracoes(texto) {
    if (!texto) return '🔒 Disponível no plano PRO';
    if (typeof texto === 'string' && texto.length > 10) {
        return '🔒 ' + texto.substring(0, 6) + '...';
    }
    return '🔒 Ative o PRO para ver';
}

// ============================================
// TEXTO DO MODO DE IA
// ============================================
function getModoTexto(modo) {
    const modos = {
        'ia_especialista': '🎓 IA Especialista (Recomendado)',
        'aleatorio_inteligente': '🎲 Aleatório Inteligente',
        'probabilistico': '📊 Probabilístico',
        'aleatorio_puro': '🎯 Aleatório Puro'
    };
    return modos[modo] || modo;
}

// ============================================
// TOAST NOTIFICATION (CORRIGIDO)
// ============================================
function mostrarToast(mensagem, tipo = 'success') {
    console.log('📢 Toast:', mensagem, tipo);
    
    // Remover toasts antigos
    const oldToasts = document.querySelectorAll('.toast-custom');
    oldToasts.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = tipo === 'success' ? '#22c55e' : tipo === 'warning' ? '#f59e0b' : '#ef4444';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    toast.style.animation = 'slideInRight 0.3s ease';
    toast.innerHTML = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ============================================
// MODAL DE LOGIN (COM E-MAIL/SENHA)
// ============================================
function mostrarModalLogin() {
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        console.log('✅ Usuário já logado, modal bloqueado');
        return;
    }
    
    if (document.querySelector('.modal-login-overlay')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-login-overlay';
    modal.innerHTML = `
        <div class="modal-login-container" style="max-width: 450px;">
            <div class="modal-login-logo">🧠</div>
            <h2 class="modal-login-title">Login Necessário</h2>
            <p class="modal-login-message">Faça login para gerar palpites e salvar seu histórico!</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="loginEmail" placeholder="E-mail" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary);">
                    <input type="password" id="loginSenha" placeholder="Senha" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <button id="btnLoginEmail" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); border: none; padding: 10px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">🔐 Entrar com E-mail</button>
                <button id="btnRegistrarEmail" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">📝 Criar Conta</button>
                <button id="btnResetarSenha" style="background: none; border: none; color: #f59e0b; cursor: pointer; font-size: 12px;">Esqueci minha senha</button>
            </div>
            
            <div style="text-align: center; color: var(--text-secondary); font-size: 12px; margin-bottom: 15px;">ou</div>
            
            <div class="login-buttons" style="display: flex; flex-direction: column; gap: 12px;">
                <button class="btn-google" onclick="window.loginGoogle(); window.fecharModalLogin?.()" style="width: 100%;">🔐 Entrar com Google</button>
                <button class="btn-facebook" onclick="window.loginFacebook(); window.fecharModalLogin?.()" style="width: 100%;">🔐 Entrar com Facebook</button>
                <button class="btn-voltar" onclick="window.fecharModalLogin?.()" style="background: #64748b; margin-top: 10px;">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos
    const btnLogin = document.getElementById('btnLoginEmail');
    const btnRegistrar = document.getElementById('btnRegistrarEmail');
    const btnResetar = document.getElementById('btnResetarSenha');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail')?.value;
            const senha = document.getElementById('loginSenha')?.value;
            if (!email || !senha) {
                mostrarToast('Preencha e-mail e senha!', 'warning');
                return;
            }
            if (typeof window.loginEmail === 'function') {
                await window.loginEmail(email, senha);
            } else {
                mostrarToast('Função loginEmail não disponível', 'error');
            }
        });
    }
    
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail')?.value;
            const senha = document.getElementById('loginSenha')?.value;
            if (!email || !senha) {
                mostrarToast('Preencha e-mail e senha!', 'warning');
                return;
            }
            if (senha.length < 6) {
                mostrarToast('Senha deve ter no mínimo 6 caracteres!', 'warning');
                return;
            }
            const nome = email.split('@')[0];
            if (typeof window.registrarEmail === 'function') {
                await window.registrarEmail(email, senha, nome);
            } else {
                mostrarToast('Função registrarEmail não disponível', 'error');
            }
        });
    }
    
    if (btnResetar) {
        btnResetar.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail')?.value;
            if (!email) {
                mostrarToast('Digite seu e-mail para recuperar a senha!', 'warning');
                return;
            }
            if (typeof window.resetarSenha === 'function') {
                await window.resetarSenha(email);
            } else {
                mostrarToast('Função resetarSenha não disponível', 'error');
            }
        });
    }
    
    window.fecharModalLogin = () => modal.remove();
}

// ============================================
// MODAL DE COMPRA DE CRÉDITOS
// ============================================
function abrirModalComprar() {
    if (!window.usuarioAtual) {
        mostrarModalLogin();
        return;
    }
    
    if (document.querySelector('.modal-pix-overlay')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-pix-overlay';
    modal.innerHTML = `
        <div class="modal-pix-container">
            <h2 style="color: #10b981; margin-bottom: 15px;">💰 Comprar Créditos</h2>
            <p style="margin-bottom: 20px; font-size: 14px;">Saldo atual: <strong>R$ ${window.creditosUsuario || 0}</strong></p>
            <p style="margin-bottom: 15px; font-size: 12px; color: var(--text-secondary);">💰 1 crédito = R$ 1,00 • Cada jogo = R$ 3,00</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                ${window.VALORES_PIX ? window.VALORES_PIX.map(valor => `
                    <button onclick="window.simularPix(${valor})" style="padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer;">
                        R$ ${valor}
                    </button>
                `).join('') : ''}
            </div>
            <p style="font-size: 11px; color: var(--text-secondary);">💡 Cada jogo custa R$ 3,00</p>
            <button onclick="window.fecharModalPix?.()" class="btn-voltar" style="margin-top: 15px;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
    window.fecharModalPix = () => modal.remove();
}

// ============================================
// SIMULAR PIX (COMPRA DE CRÉDITOS)
// ============================================
function simularPix(valor) {
    window.fecharModalPix?.();
    setTimeout(async () => {
        mostrarToast(`✅ Simulação: R$ ${valor} adicionados! (Modo demonstração)`, 'success');
        if (window.usuarioAtual) {
            const novoSaldo = (window.creditosUsuario || 0) + valor;
            window.creditosUsuario = novoSaldo;
            await window.salvarCreditoSupabase(window.usuarioAtual.uid, novoSaldo);
            
            if (typeof window.salvarTransacaoSupabase === 'function') {
                await window.salvarTransacaoSupabase(window.usuarioAtual.uid, {
                    tipo: 'compra',
                    quantidade: valor,
                    saldo: novoSaldo
                });
            }
            
            if (typeof window.atualizarInterfaceUsuario === 'function') {
                window.atualizarInterfaceUsuario();
            }
        }
    }, 500);
}

// ============================================
// ATIVAR PRO (DEMO)
// ============================================
function ativarPro() {
    if (!window.usuarioAtual) {
        mostrarModalLogin();
        return;
    }
    
    mostrarToast('⭐ Ativando plano PRO (demonstração)...', 'warning');
    setTimeout(async () => {
        window.isUserPro = true;
        window.proExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
        window.proDiasRestantes = 15;
        if (window.usuarioAtual) {
            await window.ativarProDB(window.usuarioAtual.uid, 19.90, 15);
            
            if (typeof window.salvarTransacaoSupabase === 'function') {
                await window.salvarTransacaoSupabase(window.usuarioAtual.uid, {
                    tipo: 'pro_ativacao',
                    quantidade: 1990,
                    saldo: window.creditosUsuario
                });
            }
        }
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario();
        }
        mostrarToast('⭐ Plano PRO ativado com sucesso!', 'success');
    }, 1000);
}

// ============================================
// TEMA
// ============================================
function toggleTema() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('tema', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function carregarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'light') {
        document.body.classList.add('light-mode');
    }
}

// ============================================
// QUANTIDADE DE JOGOS
// ============================================
function atualizarQuantidadePorRange(valor) {
    const qtdJogos = document.getElementById('qtdJogos');
    const qtdRange = document.getElementById('qtdRange');
    if (qtdJogos) qtdJogos.value = valor;
    if (qtdRange) qtdRange.value = valor;
}

function atualizarQuantidadePorInput(valor) {
    const qtdRange = document.getElementById('qtdRange');
    if (qtdRange) qtdRange.value = valor;
}

// ============================================
// UTILIDADES
// ============================================
function aguardarSupabase() {
    return new Promise((resolve) => {
        if (window.supabaseClient) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        }
    });
}

async function carregarCreditosDoBanco() {
    if (!window.usuarioAtual) return 0;
    try {
        const creditos = await window.carregarCreditosSupabase(window.usuarioAtual.uid);
        window.creditosUsuario = creditos;
        return creditos;
    } catch (e) {
        console.error('Erro ao carregar créditos:', e);
        return window.creditosUsuario || 5;
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.mascararConfiguracoes = mascararConfiguracoes;
window.getModoTexto = getModoTexto;
window.mostrarToast = mostrarToast;
window.mostrarModalLogin = mostrarModalLogin;
window.abrirModalComprar = abrirModalComprar;
window.simularPix = simularPix;
window.ativarPro = ativarPro;
window.toggleTema = toggleTema;
window.carregarTema = carregarTema;
window.aguardarSupabase = aguardarSupabase;
window.carregarCreditosDoBanco = carregarCreditosDoBanco;
window.atualizarQuantidadePorRange = atualizarQuantidadePorRange;
window.atualizarQuantidadePorInput = atualizarQuantidadePorInput;

console.log('✅ UTILS.js carregado - mostrarToast disponível');
