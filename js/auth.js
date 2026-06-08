// ============================================
// AUTH.js - Funções de autenticação Firebase (FASE 19)
// ============================================

// ============================================
// FIREBASE AUTH
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
    authDomain: "loteriasia.firebaseapp.com",
    projectId: "loteriasia",
    storageBucket: "loteriasia.firebasestorage.app",
    messagingSenderId: "124650527048",
    appId: "1:124650527048:web:bc335922cb9e1586c3fb7d",
    measurementId: "G-PQ8XZ46SSD"
};

// Inicializar Firebase
if (typeof firebase !== 'undefined' && (!firebase.apps || firebase.apps.length === 0)) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado');
}

const auth = firebase.auth();
let loginInProgress = false;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function isUserLoggedIn() {
    return !!auth.currentUser;
}

// ============================================
// LOGIN COM E-MAIL/SENHA
// ============================================
async function registrarEmail(email, senha, nome) {
    if (loginInProgress) {
        console.log('⏳ Login em andamento, aguarde...');
        return { success: false, error: 'Login em andamento' };
    }
    
    loginInProgress = true;
    try {
        const result = await auth.createUserWithEmailAndPassword(email, senha);
        
        if (nome && result.user) {
            await result.user.updateProfile({ displayName: nome });
            await result.user.reload();
        }
        
        console.log('✅ Usuário registrado:', email);
        
        if (typeof window.processarLogin === 'function') {
            await window.processarLogin(result.user);
        }
        
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
        
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Erro no registro:', error);
        let mensagem = error.message;
        if (error.code === 'auth/email-already-in-use') {
            mensagem = 'Este e-mail já está em uso. Faça login ou use outro e-mail.';
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensagem, 'error');
        }
        return { success: false, error: mensagem };
    } finally {
        loginInProgress = false;
    }
}

async function loginEmail(email, senha) {
    if (loginInProgress) {
        console.log('⏳ Login em andamento, aguarde...');
        return { success: false, error: 'Login em andamento' };
    }
    
    loginInProgress = true;
    try {
        const result = await auth.signInWithEmailAndPassword(email, senha);
        console.log('✅ Login email realizado:', email);
        
        if (typeof window.processarLogin === 'function') {
            await window.processarLogin(result.user);
        }
        
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
        
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Erro no login:', error);
        let mensagem = error.message;
        if (error.code === 'auth/wrong-password') {
            mensagem = 'Senha incorreta. Tente novamente.';
        } else if (error.code === 'auth/user-not-found') {
            mensagem = 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.';
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensagem, 'error');
        }
        return { success: false, error: mensagem };
    } finally {
        loginInProgress = false;
    }
}

async function resetarSenha(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('📧 E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        }
        return { success: true };
    } catch (error) {
        console.error('Erro no reset:', error);
        let mensagem = error.message;
        if (error.code === 'auth/user-not-found') {
            mensagem = 'E-mail não encontrado.';
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensagem, 'error');
        }
        return { success: false, error: mensagem };
    }
}

// ============================================
// LOGIN GOOGLE
// ============================================
async function loginGoogle() {
    if (isUserLoggedIn()) {
        console.log('✅ Usuário já logado:', auth.currentUser?.email);
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
        if (typeof window.processarLogin === 'function' && !loginInProgress) {
            loginInProgress = true;
            await window.processarLogin(auth.currentUser);
            loginInProgress = false;
        }
        return;
    }
    
    if (loginInProgress) {
        console.log('⏳ Login em andamento, aguarde...');
        return;
    }
    
    if (window.maintenanceMode) { alert('Sistema em manutenção'); return; }
    
    loginInProgress = true;
    try { 
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login Google realizado:', result.user?.email);
        
        if (typeof window.processarLogin === 'function') {
            await window.processarLogin(result.user);
        }
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
    } catch(e) { 
        if (e.code !== 'auth/popup-closed-by-user') {
            console.error('Erro login Google:', e);
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast('Erro no login: ' + (e.message || 'Tente novamente'), 'error');
            }
        }
    } finally {
        loginInProgress = false;
    }
}

// ============================================
// LOGIN FACEBOOK
// ============================================
async function loginFacebook() {
    if (isUserLoggedIn()) {
        console.log('✅ Usuário já logado:', auth.currentUser?.email);
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
        if (typeof window.processarLogin === 'function' && !loginInProgress) {
            loginInProgress = true;
            await window.processarLogin(auth.currentUser);
            loginInProgress = false;
        }
        return;
    }
    
    if (loginInProgress) {
        console.log('⏳ Login em andamento, aguarde...');
        return;
    }
    
    if (window.maintenanceMode) { alert('Sistema em manutenção'); return; }
    
    loginInProgress = true;
    try { 
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login Facebook realizado:', result.user?.email);
        
        if (typeof window.processarLogin === 'function') {
            await window.processarLogin(result.user);
        }
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
    } catch(e) { 
        if (e.code !== 'auth/popup-closed-by-user') {
            console.error('Erro login Facebook:', e);
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast('Erro no login: ' + (e.message || 'Tente novamente'), 'error');
            }
        }
    } finally {
        loginInProgress = false;
    }
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
    try { 
        await auth.signOut(); 
        window.usuarioAtual = null; 
        window.creditosUsuario = 0; 
        window.isUserPro = false; 
        window.proExpiresAt = null; 
        window.proDiasRestantes = 0;
        
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario(); 
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Logout realizado!', 'success'); 
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch(e) { 
        console.error('Erro no logout:', e); 
    }
}

// ============================================
// LISTENERS
// ============================================
function onAuthStateChanged(callback) { 
    return auth.onAuthStateChanged(callback); 
}

function getCurrentUser() {
    return auth.currentUser;
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.loginGoogle = loginGoogle;
window.loginFacebook = loginFacebook;
window.loginEmail = loginEmail;
window.registrarEmail = registrarEmail;
window.resetarSenha = resetarSenha;
window.logout = logout;
window.onAuthStateChanged = onAuthStateChanged;
window.getCurrentUser = getCurrentUser;
window.auth = auth;
window.isUserLoggedIn = isUserLoggedIn;

console.log('✅ AUTH.js carregado (com email/senha)');
