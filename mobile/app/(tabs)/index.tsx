import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LOTTERIES } from '../../src/constants/lotteries';
import { useAuthStore } from '../../src/stores/authStore';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const handleSelectLottery = (lotteryId: string) => {
        router.push({
            pathname: '/(tabs)/generate',
            params: { lottery: lotteryId }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Olá, {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}!</Text>
                <Text style={styles.subtitle}>Escolha uma loteria para começar</Text>
            </View>

            <FlatList
                data={LOTTERIES}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, { borderColor: item.cor }]}
                        onPress={() => handleSelectLottery(item.id)}
                    >
                        <Text style={styles.icon}>{item.icone}</Text>
                        <Text style={styles.name}>{item.nome}</Text>
                        <Text style={styles.rules}>
                            {item.numeros} números • 1 a {item.maxNumero}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 12,
    },
    header: {
        padding: 16,
        marginBottom: 8,
    },
    welcome: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    list: {
        gap: 12,
    },
    card: {
        flex: 1,
        margin: 6,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    icon: {
        fontSize: 32,
        marginBottom: 8,
    },
    name: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    rules: {
        color: '#94a3b8',
        fontSize: 10,
        textAlign: 'center',
    },
});
