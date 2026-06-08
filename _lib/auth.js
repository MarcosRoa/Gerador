// ============================================
// BLOCO: VALIDAÇÃO FIREBASE TOKEN
// FUNÇÃO: Verifica token do Firebase e retorna UID
// ============================================

// Importar Firebase Admin (será instalado depois)
// Por enquanto, função simplificada

export async function validateFirebaseToken(token) {
    // TODO: Implementar validação real com firebase-admin
    // Por enquanto, aceita qualquer token e extrai UID do header
    
    // Em produção real, use:
    // const decoded = await admin.auth().verifyIdToken(token)
    // return decoded.uid
    
    return null // Será implementado após instalar firebase-admin
}

// Função para extrair UID do request (temporário)
export function getUserIdFromRequest(req) {
    // Prioridade: header -> query -> body
    return req.headers['x-user-id'] || req.query.uid || req.body?.uid
}

// Função para extrair email do request
export function getUserEmailFromRequest(req) {
    return req.headers['x-user-email'] || req.query.email || req.body?.email
}
