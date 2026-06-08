// ============================================
// JOGOS.js - Geração de palpites (FASE E - API INTEGRADA)
// ============================================

// ... (manter funções auxiliares existentes)

async function gerarJogos() {
    if (!window.usuarioAtual) { 
        window.mostrarModalLogin(); 
        return; 
    }
    
    const qtd = parseInt(document.getElementById('qtdJogos')?.value || 1);
    const valorTotal = qtd * 3;
    const validacao = validarSaldoEAcesso(qtd, valorTotal);
    if (!validacao.valido) return;
    
    const dadosFiltrados = window.filtrarDados();
    if (dadosFiltrados.length < 10) {
        document.getElementById('resultados').innerHTML = `<div class="mensagem-erro">⚠️ Dados insuficientes! Apenas ${dadosFiltrados.length} concursos.</div>`;
        return;
    }
    
    // Verificar IA treinada
    let iaTreinada = window.iaTreinada ? window.iaTreinada() : false;
    let aiModel = window.aiModel ? window.aiModel() : null;
    if (!iaTreinada || !aiModel) {
        if (typeof window.treinarIAComFiltrosAtuais === 'function') {
            await window.treinarIAComFiltrosAtuais();
        }
        iaTreinada = window.iaTreinada ? window.iaTreinada() : false;
        aiModel = window.aiModel ? window.aiModel() : null;
    }
    
    const modo = document.getElementById('modoGeracao')?.value || 'ia_especialista';
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    const config = window.LOTERIAS[loteria];
    const dados = window.filtrarDados();
    const dispersao = window.dispersaoAtual ? window.dispersaoAtual() : 15;
    const filtrosTreinamento = window.filtrosTreinamento ? window.filtrosTreinamento() : null;
    
    const modoBolaoAtivo = document.getElementById('modoBolaoCheckbox')?.checked || false;
    let quantidadeNumerosJogo = config.jogoSimples;
    if (modoBolaoAtivo && config.permiteBolao) {
        if (!window.isUserPro) { 
            window.mostrarToast('⭐ Modo Bolão é exclusivo para PRO!', 'warning'); 
            return; 
        }
        quantidadeNumerosJogo = parseInt(document.getElementById('qtdNumerosBolao')?.value || config.jogoSimples);
        if (quantidadeNumerosJogo > config.maxNumeros || quantidadeNumerosJogo < config.minNumeros) {
            quantidadeNumerosJogo = config.jogoSimples;
        }
    }
    
    const hashtagConfig = window.formatarConfiguracoesHashtag ? window.formatarConfiguracoesHashtag() : '';
    
    // ============================================
    // GERAR JOGOS LOCALMENTE (IA no frontend)
    // ============================================
    const jogosGerados = [];
    const jogosExtras = [];
    const mesesJogos = [];
    const timesGerados = [];
    
    for (let i = 0; i < qtd; i++) {
        let numeros = [];
        if (modo === 'ia_especialista' && aiModel && iaTreinada) {
            numeros = aiModel.predizerIAEspecialista(quantidadeNumerosJogo, config.temDispersao, dispersao, i);
        } else if (modo === 'aleatorio_inteligente') {
            numeros = window.gerarJogoAleatorioInteligente(config, dados, quantidadeNumerosJogo);
        } else if (modo === 'probabilistico') {
            numeros = window.gerarJogoProbabilistico(config, dados, quantidadeNumerosJogo);
        } else {
            numeros = window.gerarJogoAleatorioPuro(config, quantidadeNumerosJogo);
        }
        jogosGerados.push(numeros);
        
        if (config.temMes && loteria === 'diadesorte') {
            const mesSorte = aiModel ? aiModel.predizerMesSorte() : Math.floor(Math.random() * 12) + 1;
            mesesJogos.push(mesSorte);
        }
        if (config.temTrevos && loteria === 'milionaria') {
            const trevos = aiModel ? aiModel.predizerTrevos(config.numTrevos) : 
                (() => { const t = new Set(); while(t.size < config.numTrevos) t.add(Math.floor(Math.random() * 6) + 1); return Array.from(t).sort(); })();
            jogosExtras.push(`Trevos: ${trevos.join(', ')}`);
        }
        if (loteria === 'timemania') {
            const timeCoracao = aiModel ? aiModel.predizerTimeSorte() : Math.floor(Math.random() * 80) + 1;
            timesGerados.push(timeCoracao);
        }
    }
    
    const confianca = aiModel && iaTreinada ? aiModel.confianca : 50;
    
    // ============================================
    // NOVO: SALVAR VIA API (em vez de Supabase direto)
    // ============================================
    try {
        const result = await window.apiClient.generateGames({
            lottery: loteria,
            quantity: qtd,
            mode: modo,
            extraNumbers: quantidadeNumerosJogo,
            filters: {
                periodo: window.periodoSelecionado ? window.periodoSelecionado() : 'all',
                dispersao: dispersao,
                modoBolao: modoBolaoAtivo
            }
        });
        
        if (result.creditsRemaining !== undefined) {
            window.creditosUsuario = result.creditsRemaining;
        }
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s)! Saldo: R$ ${window.creditosUsuario}`, 'success');
    } catch (error) {
        console.error('Erro na API:', error);
        
        // Fallback: salvar localmente e atualizar créditos manualmente
        window.creditosUsuario -= valorTotal;
        window.mostrarToast(`${qtd} jogo(s) gerado(s) (salvo localmente)! Saldo: R$ ${window.creditosUsuario}`, 'warning');
    }
    
    // Renderizar resultados
    window.renderizarResultadosJogos(jogosGerados, mesesJogos, jogosExtras, config, confianca, filtrosTreinamento, window.isUserPro, hashtagConfig, quantidadeNumerosJogo, timesGerados);
    
    if (typeof window.atualizarInterfaceUsuario === 'function') {
        window.atualizarInterfaceUsuario();
    }
}

// Substituir a função antiga
window.gerarJogos = gerarJogos;

console.log('✅ JOGOS.js atualizado (FASE E)');
