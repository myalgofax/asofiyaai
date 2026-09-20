import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '@/context/LanguageContext';
import { VoiceProvider } from '@/context/VoiceContext';
import { requestStartupPermissions } from '@/services/permissions';

export default function Layout() {
    useEffect(() => {
        void requestStartupPermissions().catch(() => undefined);
    }, []);

    return (
        <SafeAreaProvider>
            <LanguageProvider>
                <VoiceProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </VoiceProvider>
            </LanguageProvider>
        </SafeAreaProvider>
    );
}
