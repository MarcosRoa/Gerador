-- ============================================
-- api/_lib/rpc/generate_game.sql
-- FUNÇÕES RPC PARA TRANSAÇÕES ATÔMICAS
-- Instalar no Supabase SQL Editor
-- ============================================

-- ============================================
-- RPC: generate_game
-- FUNÇÃO ATÔMICA: Gera jogos e debita créditos
-- TUDO ou NADA - Transação garantida
-- ============================================

CREATE OR REPLACE FUNCTION generate_game(
    p_user_uid TEXT,
    p_lottery TEXT,
    p_games JSONB,
    p_cost INTEGER,
    p_mode TEXT,
    p_extra_numbers INTEGER DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_balance INTEGER;
    v_new_balance INTEGER;
    v_game_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Buscar user_id pelo uid
    SELECT id, creditos INTO v_user_id, v_balance 
    FROM usuarios 
    WHERE uid = p_user_uid 
    FOR UPDATE;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_user_uid;
    END IF;
    
    -- 2. Verificar idempotência
    IF p_idempotency_key IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM transacoes WHERE idempotency_key = p_idempotency_key) THEN
            SELECT resultado INTO v_result 
            FROM transacoes 
            WHERE idempotency_key = p_idempotency_key;
            RETURN v_result;
        END IF;
    END IF;
    
    -- 3. Validar saldo
    IF v_balance < p_cost THEN
        RAISE EXCEPTION 'Saldo insuficiente. Disponível: R$ %, Necessário: R$ %', 
            v_balance, p_cost;
    END IF;
    
    -- 4. Calcular novo saldo
    v_new_balance := v_balance - p_cost;
    
    -- 5. Debitar créditos
    UPDATE usuarios 
    SET creditos = v_new_balance, updated_at = NOW() 
    WHERE id = v_user_id;
    
    -- 6. Registrar transação
    INSERT INTO transacoes (
        usuario_uid, tipo, quantidade, saldo_apos, 
        reference_id, idempotency_key, metadata, created_at
    ) VALUES (
        p_user_uid, 'uso', p_cost, v_new_balance,
        gen_random_uuid()::TEXT, p_idempotency_key,
        jsonb_build_object('lottery', p_lottery, 'mode', p_mode, 'extra_numbers', p_extra_numbers),
        NOW()
    );
    
    -- 7. Salvar histórico de palpites
    INSERT INTO historico_palpites (
        usuario_uid, loteria, jogos, quantidade_numeros, data
    ) VALUES (
        p_user_uid, p_lottery, p_games, p_extra_numbers, NOW()
    )
    RETURNING id INTO v_game_id;
    
    -- 8. Montar resultado
    v_result := jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'game_id', v_game_id,
        'games', p_games,
        'cost', p_cost
    );
    
    -- 9. Salvar resultado para idempotência
    IF p_idempotency_key IS NOT NULL THEN
        UPDATE transacoes 
        SET resultado = v_result 
        WHERE idempotency_key = p_idempotency_key;
    END IF;
    
    RETURN v_result;
END;
$$;

-- ============================================
-- RPC: add_credits (compra via PIX)
-- ============================================

CREATE OR REPLACE FUNCTION add_credits(
    p_user_uid TEXT,
    p_amount INTEGER,
    p_payment_id TEXT,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_balance INTEGER;
    v_new_balance INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Buscar user_id pelo uid
    SELECT id, creditos INTO v_user_id, v_balance 
    FROM usuarios 
    WHERE uid = p_user_uid 
    FOR UPDATE;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_user_uid;
    END IF;
    
    -- 2. Verificar idempotência
    IF p_idempotency_key IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM transacoes WHERE idempotency_key = p_idempotency_key) THEN
            SELECT resultado INTO v_result 
            FROM transacoes 
            WHERE idempotency_key = p_idempotency_key;
            RETURN v_result;
        END IF;
    END IF;
    
    -- 3. Verificar se pagamento já foi processado
    IF EXISTS (SELECT 1 FROM transacoes WHERE reference_id = p_payment_id AND tipo = 'compra') THEN
        RETURN jsonb_build_object('success', true, 'already_processed', true);
    END IF;
    
    -- 4. Calcular novo saldo
    v_new_balance := v_balance + p_amount;
    
    -- 5. Adicionar créditos
    UPDATE usuarios 
    SET creditos = v_new_balance, updated_at = NOW() 
    WHERE id = v_user_id;
    
    -- 6. Registrar transação
    INSERT INTO transacoes (
        usuario_uid, tipo, quantidade, saldo_apos, 
        reference_id, p_idempotency_key,
        jsonb_build_object('payment_id', p_payment_id),
        NOW()
    ) VALUES (
        p_user_uid, 'compra', p_amount, v_new_balance,
        p_payment_id, p_idempotency_key,
        jsonb_build_object('payment_id', p_payment_id),
        NOW()
    );
    
    -- 7. Montar resultado
    v_result := jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'added_amount', p_amount
    );
    
    RETURN v_result;
END;
$$;

-- ============================================
-- VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- ============================================

SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('generate_game', 'add_credits');
