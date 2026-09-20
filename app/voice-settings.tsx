import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useVoice } from '@/context/VoiceContext';
import { speak } from '@/services/speech';

const rates = [{ label: 'Slow', value: .72 }, { label: 'Learning', value: .86 }, { label: 'Natural', value: 1 }, { label: 'Fast', value: 1.12 }];
export default function VoiceSettingsScreen() {
    const { language } = useLanguage(); const { settings, setSettings, voices, resolveVoice } = useVoice();
    const compatible = useMemo(() => voices.filter(v => v.language.toLowerCase().startsWith(language.code)), [voices, language.code]);
    const selected = resolveVoice(language);
    const preview = () => speak(language.code === 'es' ? 'Hola, soy Sofiya. Practiquemos juntos.' : language.code === 'fr' ? "Bonjour, je suis Sofiya. Pratiquons ensemble." : language.code === 'ja' ? 'こんにちは、ソフィヤです。一緒に練習しましょう。' : language.code === 'de' ? 'Hallo, ich bin Sofiya. Lass uns zusammen üben.' : language.code === 'it' ? 'Ciao, sono Sofiya. Esercitiamoci insieme.' : language.code === 'ko' ? '안녕하세요, 소피야예요. 같이 연습해요.' : `Hello, I am Sofiya. Let's practice together.`, language.locale, settings, selected?.identifier);
    return <SafeAreaView style={s.page}><View style={s.top}><Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.title}>Sofiya Voice</Text></View><ScrollView contentContainerStyle={s.body}>
        <Text style={s.h}>Voice selection</Text><Text style={s.help}>Sofiya automatically prefers a high-quality voice for {language.name}. To choose a particular male/female voice, select the exact voice installed on your device below; system voice metadata does not reliably expose gender across iOS and Android.</Text>
        <Text style={s.h}>Speaking speed</Text><View style={s.wrap}>{rates.map(r => <Pressable key={r.label} onPress={() => setSettings(x => ({ ...x, rate: r.value }))} style={[s.chip, Math.abs(settings.rate - r.value) < .01 && s.on]}><Text style={s.chipText}>{r.label}</Text></Pressable>)}</View>
        <Text style={s.h}>Installed {language.name} voices</Text><Text style={s.help}>{compatible.length ? `${compatible.length} compatible voice${compatible.length === 1 ? '' : 's'} found on this device.` : 'No matching system voice is currently installed. The OS will use its fallback voice.'}</Text>
        {compatible.map(v => <Pressable key={v.identifier} onPress={() => setSettings(x => ({ ...x, voiceId: v.identifier }))} style={[s.voice, settings.voiceId === v.identifier && s.voiceOn]}><View style={{ flex: 1 }}><Text style={s.voiceName}>{v.name}</Text><Text style={s.meta}>{v.language} · {v.quality}</Text></View><Text>{settings.voiceId === v.identifier ? '✓' : ''}</Text></Pressable>)}
        <Pressable style={s.preview} onPress={preview}><Text style={s.previewText}>▶ Preview Sofiya</Text></Pressable>
    </ScrollView></SafeAreaView>
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: '#fff' }, top: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#eee' }, back: { fontSize: 38, marginRight: 12 }, title: { fontSize: 20, fontWeight: '900' }, body: { padding: 20, paddingBottom: 40 }, h: { fontSize: 18, fontWeight: '900', marginTop: 18, marginBottom: 8 }, help: { color: '#64748B', lineHeight: 20, marginBottom: 10 }, row: { flexDirection: 'row', gap: 8 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: '#D1D5DB' }, on: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' }, chipText: { fontWeight: '800' }, voice: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, marginBottom: 8 }, voiceOn: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' }, voiceName: { fontWeight: '800' }, meta: { color: '#64748B', fontSize: 12, marginTop: 3 }, preview: { marginTop: 24, backgroundColor: '#111827', padding: 16, borderRadius: 14, alignItems: 'center' }, previewText: { color: '#fff', fontWeight: '900' } });
