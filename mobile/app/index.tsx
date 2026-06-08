import React, { useEffect, useRef } from 'react';
import { View, Dimensions, Vibration, StatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    
    const scale = useSharedValue(0.1);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
        startTransformerEffect();
    }, []);
    
    const startTransformerEffect = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            
            scale.value = withSequence(
                withTiming(1.2, { duration: 800, easing: Easing.out(Easing.exp) }),
                withSpring(1, { damping: 12, stiffness: 80 })
            );
            
            rotate.value = withSequence(
                withTiming(360, { duration: 600, easing: Easing.linear }),
                withTiming(0, { duration: 0 })
            );
            
            opacity.value = withTiming(1, { duration: 300 });
            
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(auth)/login');
            }, 2000);
            
        } catch (error) {
            console.error('Erro:', error);
            router.replace('/(auth)/login');
        }
    };
    
    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
        opacity: opacity.value
    }));
    
    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
            <StatusBar hidden />
            
            <Animated.View style={[{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: '#8b5cf6',
                opacity: 0.3,
                shadowColor: '#8b5cf6',
                shadowRadius: 30,
                shadowOpacity: 0.8
            }, logoStyle]} />
            
            <Animated.View style={logoStyle}>
                <View style={{ width: 150, height: 150, backgroundColor: '#8b5cf6', borderRadius: 75, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView
                        source={require('../assets/animations/transformer-splash.json')}
                        style={{ width: 200, height: 200 }}
                        autoPlay
                        loop={false}
                    />
                </View>
            </Animated.View>
        </View>
    );
}
