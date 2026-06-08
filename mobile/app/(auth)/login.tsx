import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const { loginWithEmail, isLoading, error } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha e-mail e senha');
            return;
        }
        const success = await loginWithEmail(email, password);
        if (success) {
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <View style={styles.header}>
                <Text style={styles.title}>🧠 Loterias IA</Text>
                <Text style={styles.subtitle}>Sistema Profissional com IA Real</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                    <Text style={styles.loginButtonText}>
                        {isLoading ? '🔐 Entrando...' : '🔐 Entrar'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.registerText}>Não tem conta? Criar conta</Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        color: '#ffffff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    loginButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 30,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerText: {
        color: '#38bdf8',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 20,
    },
});
