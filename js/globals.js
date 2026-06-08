// ============================================
// GLOBALS.js - Variáveis globais do sistema (FASE 19)
// ============================================

const USUARIOS_PRO = [
    'mresquadriasaluminio@gmail.com',
    'admin@loteriasia.com',
    'suporte@loteriasia.com'
];

let isAdminMode = false;
let maintenanceMode = false;
let isUserPro = false;
let proExpiresAt = null;
let proDiasRestantes = 0;
let usuarioAtual = null;
let creditosUsuario = 0;
let processandoLogin = false;
let initExecuted = false;

const VERSAO = "6.1.0";

function isAdminUser() { return false; }

function isEmailPro(email) {
    if (!email) return false;
    return USUARIOS_PRO.includes(email.toLowerCase());
}

window.isAdminMode = isAdminMode;
window.maintenanceMode = maintenanceMode;
window.isUserPro = isUserPro;
window.proExpiresAt = proExpiresAt;
window.proDiasRestantes = proDiasRestantes;
window.usuarioAtual = usuarioAtual;
window.creditosUsuario = creditosUsuario;
window.processandoLogin = processandoLogin;
window.initExecuted = initExecuted;
window.VERSAO = VERSAO;
window.isAdminUser = isAdminUser;
window.isEmailPro = isEmailPro;
window.USUARIOS_PRO = USUARIOS_PRO;

console.log(`🚀 Loterias ${VERSAO} - FASE 19 - PRO corrigido`);
