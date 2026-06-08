import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LOTTERIES } from '../../src/constants/lotteries';
import { generateGames } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { NumberBall } from '../../src/components/NumberBall';

export default function GenerateScreen() {
    const router = useRouter();
    const { lottery: lotteryParam } = useLocalSearchParams();
    const { user } = useAuthStore();
    
    const lottery = LOTTERIES.find(l => l.id === lotteryParam) || LOTTERIES[0];
    const [quantity, setQuantity] = useState(1);
    const [mode, setMode] = useState('ia_especialista');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
    const [creditsRemaining, setCreditsRemaining] = useState(0);

    const handleGenerate = async () => {
        if (!user) {
            Alert.alert('Erro', 'Faça login para gerar jogos');
            router.push('/(auth)/login');
            return;
        }

        setIsGenerating(true);
        setGeneratedGames([]);

        try {
            const result = await generateGames({
                lottery: lottery.id,
                quantity: quantity,
                mode: mode,
            });

            setGeneratedGames(result.games || []);
            setCreditsRemaining(result.creditsRemaining);
            
            Alert.alert('Sucesso!', `${quantity} jogo(s) gerado(s)!`);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erro', error.response?.data?.error || 'Erro ao gerar jogos');
        } finally {
            setIsGenerating(false);
        }
    };

    const increaseQuantity = () => {
        if (quantity < 20) setQuantity(quantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.lotteryIcon}>{lottery.icone}</Text>
                <Text style={styles.lotteryName}>{lottery.nome}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>📊 Quantidade de Jogos</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.costText}>💰 R$ {quantity * 3},00</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>🎓 Modo de IA</Text>
                <View style={styles.modeContainer}>
                    <TouchableOpacity 
                        style={[styles.modeButton, mode === 'ia_especialista' && styles.modeActive]}
                        onPress={() => setMode('ia_especialista')}
                    >
                        <Text style={styles.modeText}>🎓 IA Especialista</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modeButton, mode === 'aleatorio_puro' && styles.modeActive]}
                        onPress={() => setMode('aleatorio_puro')}
                    >
                        <Text style={styles.modeText}>🎲 Aleatório</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.generateButton, isGenerating && styles.disabledButton]}
                onPress={handleGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.generateButtonText}>🎲 GERAR JOGOS (R$ 3,00/jogo)</Text>
                )}
            </TouchableOpacity>

            {generatedGames.length > 0 && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>🎯 RESULTADO</Text>
                    {generatedGames.map((game, idx) => (
                        <View key={idx} style={styles.gameContainer}>
                            <Text style={styles.gameTitle}>Jogo {idx + 1}</Text>
                            <View style={styles.ballsContainer}>
                                {game.map((num, numIdx) => (
                                    <NumberBall key={numIdx} number={num} color={lottery.cor} />
                                ))}
                            </View>
                        </View>
                    ))}
                    <Text style={styles.creditsText}>💰 Saldo restante: R$ {creditsRemaining}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 16,
    },
    lotteryIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    lotteryName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    quantityButton: {
        width: 44,
        height: 44,
        backgroundColor: '#334155',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    quantityValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f59e0b',
        minWidth: 50,
        textAlign: 'center',
    },
    costText: {
        fontSize: 14,
        color: '#f59e0b',
        textAlign: 'center',
        marginTop: 12,
    },
    modeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#334155',
        borderRadius: 12,
        alignItems: 'center',
    },
    modeActive: {
        backgroundColor: '#8b5cf6',
    },
    modeText: {
        color: '#ffffff',
        fontWeight: '500',
    },
    generateButton: {
        backgroundColor: '#22c55e',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginBottom: 16,
        textAlign: 'center',
    },
    gameContainer: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#0f172a',
        borderRadius: 12,
    },
    gameTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 8,
    },
    ballsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    creditsText: {
        fontSize: 14,
        color: '#f59e0b',
        textAlign: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
});
