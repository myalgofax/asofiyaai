import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
function getNativeSR() {
  try { return require('expo-speech-recognition').ExpoSpeechRecognitionModule; } catch { return null; }
}
const { useSpeechRecognitionEvent } = (() => {
  try { return require('expo-speech-recognition'); }
  catch { return { useSpeechRecognitionEvent: (_e: string, _h: any) => {} }; }
})();
import { SofiyaAvatar } from '@/components/SofiyaAvatar';
import { ChatBubble } from '@/components/ChatBubble';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/constants/languages';
import { sendTutorMessage } from '@/services/api';
import { speak, stopSpeaking } from '@/services/speech';
import { useVoice } from '@/context/VoiceContext';
import { ChatMessage } from '@/types/chat';

const VOICE_COMPLETION_DELAY = 2500;

export default function Chat() {
  const { language, setLanguage } = useLanguage();
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const { settings: voiceSettings, resolveVoice } = useVoice();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'hello', role: 'assistant', text: `Hi, I’m Sofiya! Let’s practice ${language.name} together. Tell me about your day, or choose a conversation starter below.` }]);
  const messagesListRef = useRef<FlatList<ChatMessage> | null>(null);
  const messagesRef = useRef(messages);
  const voiceRef = useRef(false);
  const busyRef = useRef(false);
  const finalRef = useRef('');
  const voiceDraftRef = useRef('');
  const listenRequestRef = useRef(false);
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollMessagesToEnd = useCallback(() => {
    requestAnimationFrame(() => messagesListRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => { messagesRef.current = messages }, [messages]);
  useEffect(() => { voiceRef.current = voiceMode }, [voiceMode]);
  useEffect(() => { busyRef.current = busy }, [busy]);
  useEffect(() => {
    scrollMessagesToEnd();
  }, [messages.length, scrollMessagesToEnd]);

  const webRecogRef = useRef<any>(null);
  const scheduleNextListenRef = useRef<() => void>(() => {});
  const submitRef = useRef<(v: string, fromVoice?: boolean) => Promise<void>>(async () => {});

  const useWebSpeech = useCallback((): boolean => {
    try { const m = getNativeSR(); return !m || !m.isRecognitionAvailable?.(); } catch { return true; }
  }, []);

  const startWebSpeech = useCallback((locale: string) => {
    const browser = window as any;
    const SR = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SR) throw new Error('Speech recognition not supported. Try Chrome or Edge.');
    finalRef.current = '';
    setPartial('');
    setListening(true);
    const recog = new SR();
    webRecogRef.current = recog;
    recog.lang = locale;
    recog.interimResults = true;
    recog.continuous = false;
    recog.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      if (interim) setPartial(interim);
      if (final) { finalRef.current = final; setPartial(final); }
    };
    recog.onerror = (e: any) => {
      setListening(false); webRecogRef.current = null;
      if (e.error === 'no-speech' || e.error === 'aborted') {
        if (voiceRef.current && !busyRef.current) scheduleNextListenRef.current();
        return;
      }
      setVoiceMode(false); setVoiceError(`Mic error: ${e.error}`);
    };
    recog.onend = () => {
      setListening(false); webRecogRef.current = null;
      const transcript = finalRef.current.trim(); finalRef.current = '';
      if (transcript) voiceDraftRef.current = [voiceDraftRef.current, transcript].filter(Boolean).join(' ');
      if (voiceDraftRef.current) {
        if (voiceSubmitTimerRef.current) clearTimeout(voiceSubmitTimerRef.current);
        voiceSubmitTimerRef.current = setTimeout(() => {
          voiceSubmitTimerRef.current = null;
          const draft = voiceDraftRef.current; voiceDraftRef.current = '';
          submitRef.current(draft, true);
        }, VOICE_COMPLETION_DELAY);
      }
      if (voiceRef.current && !busyRef.current) scheduleNextListenRef.current();
    };
    recog.start();
  }, []);

  const startListening = useCallback(async () => {
    if (!voiceRef.current || busyRef.current || listenRequestRef.current) return;
    listenRequestRef.current = true;
    try {
      if (useWebSpeech()) {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        }
        startWebSpeech(language.locale);
        listenRequestRef.current = false;
        return;
      }
      const m = getNativeSR();
      const p = await m.requestPermissionsAsync();
      if (!p.granted) {
        setVoiceMode(false);
        Alert.alert('Microphone permission needed', 'Enable microphone and speech recognition permissions to use hands-free conversation.');
        return;
      }
      finalRef.current = ''; setPartial('');
      m.start({ lang: language.locale, interimResults: true, continuous: false });
    } catch (e) {
      setVoiceMode(false);
      setVoiceError(e instanceof Error ? e.message : 'Could not start speech recognition');
      Alert.alert('Speech recognition unavailable', e instanceof Error ? e.message : 'Could not start speech recognition');
    } finally {
      listenRequestRef.current = false;
    }
  }, [language.locale, useWebSpeech, startWebSpeech]);

  const scheduleNextListen = useCallback(() => {
    if (!voiceRef.current || busyRef.current || listenRequestRef.current) return;
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    listenTimerRef.current = setTimeout(() => {
      listenTimerRef.current = null;
      if (voiceRef.current && !busyRef.current) {
        void startListening();
      }
    }, 350);
  }, [startListening]);

  const submit = useCallback(async (value: string, fromVoice = false) => {
    const v = value.trim();
    if (!v || busyRef.current) return;

    try { webRecogRef.current?.stop(); webRecogRef.current = null; } catch { }
    try { getNativeSR()?.stop(); } catch { }

    setListening(false);
    setPartial('');
    setText('');
    setChatError('');
    setBusy(true);
    busyRef.current = true;

    const user: ChatMessage = { id: String(Date.now()), role: 'user', text: v };
    const next = [...messagesRef.current, user];
    setMessages(next);
    messagesRef.current = next;

    try {
      const out = await sendTutorMessage(v, language.name, next.slice(-30).map(x => ({ role: x.role, text: x.text })));
      const bot: ChatMessage = { id: String(Date.now() + 1), role: 'assistant', text: out.reply, correction: out.correction };
      const updated = [...next, bot];
      setMessages(updated);
      messagesRef.current = updated;

      setBusy(false);
      busyRef.current = false;

      speak(out.reply, language.locale, voiceSettings, resolveVoice(language)?.identifier, {
        onDone: () => {
          if (voiceRef.current) scheduleNextListen();
        },
        onError: () => {
          if (voiceRef.current) scheduleNextListen();
        }
      });
    } catch (e) {
      setBusy(false);
      busyRef.current = false;
      setMessages(next.slice(0, -1));
      messagesRef.current = next.slice(0, -1);
      setChatError(e instanceof Error ? e.message : 'Could not reach Sofiya.');
      setText(v);
      if (fromVoice && voiceRef.current) scheduleNextListen();
    }
  }, [language.name, language.locale, scheduleNextListen, voiceSettings, resolveVoice]);

  useEffect(() => { scheduleNextListenRef.current = scheduleNextListen; }, [scheduleNextListen]);
  useEffect(() => { submitRef.current = submit; }, [submit]);
  useSpeechRecognitionEvent('result', (event: any) => {
    const result = event.results?.[0];
    if (!result) return;
    if (voiceSubmitTimerRef.current) {
      clearTimeout(voiceSubmitTimerRef.current);
      voiceSubmitTimerRef.current = null;
    }
    const transcript = typeof result.transcript === 'string' ? result.transcript : (result.transcript?.[0] ?? '');
    setPartial(transcript);
    if (event.isFinal || result.isFinal) {
      finalRef.current = transcript;
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    const transcript = finalRef.current.trim();
    finalRef.current = '';

    if (transcript) {
      voiceDraftRef.current = [voiceDraftRef.current, transcript].filter(Boolean).join(' ');
    }

    if (voiceDraftRef.current) {
      if (voiceSubmitTimerRef.current) clearTimeout(voiceSubmitTimerRef.current);
      voiceSubmitTimerRef.current = setTimeout(() => {
        voiceSubmitTimerRef.current = null;
        const draft = voiceDraftRef.current;
        voiceDraftRef.current = '';
        submit(draft, true);
      }, VOICE_COMPLETION_DELAY);
    }

    if (voiceRef.current && !busyRef.current) {
      scheduleNextListen();
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    setListening(false);
    if (event.error === 'no-speech' || event.error === 'aborted') {
      if (voiceRef.current && !busyRef.current) scheduleNextListen();
      return;
    }
    setVoiceMode(false);
    setVoiceError(event.message || `Speech recognition error: ${event.error || 'unknown error'}`);
    Alert.alert('Voice mode stopped', event.message || 'Speech recognition error');
  });

  async function toggleVoice() {
    if (voiceMode) {
      voiceRef.current = false;
      setVoiceMode(false);
      setVoiceError('');
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
      if (voiceSubmitTimerRef.current) clearTimeout(voiceSubmitTimerRef.current);
      voiceSubmitTimerRef.current = null;
      voiceDraftRef.current = '';
      try { webRecogRef.current?.abort(); webRecogRef.current = null; } catch { }
      try { getNativeSR()?.abort(); } catch { }
      stopSpeaking();
      setListening(false);
      setPartial('');
      return;
    }

    voiceRef.current = true;
    setVoiceMode(true);
    setVoiceError('');
    stopSpeaking();
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    listenTimerRef.current = null;
    void startListening();
  }

  useEffect(() => () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    if (voiceSubmitTimerRef.current) clearTimeout(voiceSubmitTimerRef.current);
    voiceRef.current = false;
    try { webRecogRef.current?.abort(); webRecogRef.current = null; } catch { }
    try { getNativeSR()?.abort(); } catch { }
    stopSpeaking();
  }, []);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.shell}>
        <View style={s.top}>
          <View style={s.brandMark}><Ionicons name="sparkles" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.brand}>sofiya<Text style={{ color: '#c58e52' }}>.</Text></Text>
            <Text style={s.caption}>Your everyday language companion</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Voice settings" onPress={() => router.push('/voice-settings')} style={s.gear}>
            <Ionicons name="options-outline" size={22} color="#405b53" />
          </Pressable>
        </View>
        <View style={[s.hero, compact && { paddingVertical: 16, gap: 12 }]}>
          <SofiyaAvatar size={compact ? 66 : 88} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.eyebrow}>A LITTLE PRACTICE, EVERY DAY</Text>
            <Text style={[s.title, compact && { fontSize: 23 }]}>Let’s talk, naturally.</Text>
            <View style={s.statusRow}><View style={s.statusDot} /><Text style={s.statusText}>{busy ? 'Sofiya is thinking…' : listening ? 'Sofiya is listening' : 'A friendly space to find your words'}</Text></View>
          </View>
        </View>
        <View style={s.toolbar}>
          <View style={s.languagePickerWrap}>
            <Ionicons name="globe-outline" size={18} color="#547166" />
            <Picker accessibilityLabel="Practice language" selectedValue={language.code} onValueChange={(value) => {
              const selected = LANGUAGES.find((item) => item.code === value);
              if (selected) {
                setLanguage(selected);
                if (messagesRef.current.length === 1) {
                  const greeting: ChatMessage[] = [{ id: 'hello', role: 'assistant', text: `Hi, I’m Sofiya! Let’s practice ${selected.name} together. Tell me about your day, or choose a conversation starter below.` }];
                  setMessages(greeting);
                  messagesRef.current = greeting;
                }
              }
            }} style={s.languagePicker} dropdownIconColor="#316b5d">
              {LANGUAGES.map((item) => <Picker.Item key={item.code} label={`${item.emoji} ${item.name}`} value={item.code} />)}
            </Picker>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={voiceMode ? 'Stop hands-free conversation' : 'Start hands-free conversation'} accessibilityState={{ selected: voiceMode }} style={[s.voiceToggle, voiceMode && s.voiceOn]} onPress={toggleVoice}>
            <Ionicons name={voiceMode ? 'stop-circle-outline' : 'headset-outline'} size={18} color={voiceMode ? '#fff' : '#316b5d'} />
            <Text style={[s.voiceToggleText, voiceMode && { color: '#fff' }]}>{voiceMode ? 'End voice' : 'Voice chat'}</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView style={s.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {voiceMode && <View style={s.voiceBar}>
            <Text accessibilityLiveRegion="polite" style={s.voiceBarText}>{busy ? 'Sofiya is thinking…' : partial ? 'Heard: ' + partial : listening ? 'Listening… take your time.' : 'Getting ready to listen…'}</Text>
            <Text style={s.voiceHint}>Hands-free conversation · tap End voice to stop</Text>
          </View>}
          {!!voiceError && <Text accessibilityRole="alert" style={s.error}>{voiceError}</Text>}
          {!!chatError && <Text accessibilityRole="alert" style={s.error}>Couldn’t send your message. {chatError} Your text is ready to retry below.</Text>}
          <FlatList ref={messagesListRef} style={s.list} data={messages} keyExtractor={(x) => x.id}
            renderItem={({ item }) => <ChatBubble m={item} />}
            contentContainerStyle={[s.messageListContent, compact && { paddingHorizontal: 16 }]}
            ListHeaderComponent={<Text style={s.sessionLabel}>YOUR PRACTICE SPACE · {language.name.toUpperCase()}</Text>}
            ListFooterComponent={busy ? <View style={s.thinking}><ActivityIndicator size="small" color="#347b68" /><Text accessibilityLiveRegion="polite" style={s.statusText}>Sofiya is thinking…</Text></View> : messages.length === 1 ? <View style={s.starters}>
              <Text style={s.starterLabel}>A little inspiration to get started</Text>
              {[
                { icon: 'sunny-outline' as const, label: 'Talk about my day', prompt: 'Help me talk about my day.' },
                { icon: 'cafe-outline' as const, label: 'Order at a café', prompt: 'Let’s practice ordering at a café.' },
                { icon: 'chatbubbles-outline' as const, label: 'Introduce myself', prompt: 'Help me introduce myself.' },
              ].map(item => <Pressable key={item.label} accessibilityRole="button" disabled={voiceMode} onPress={() => submit(item.prompt)} style={({ pressed }) => [s.starter, pressed && { backgroundColor: '#e5efe9' }, voiceMode && { opacity: 0.5 }]}>
                <Ionicons name={item.icon} size={18} color="#347b68" /><Text style={s.starterText}>{item.label}</Text><Ionicons name="arrow-forward" size={16} color="#81988e" />
              </Pressable>)}
            </View> : null}
            onContentSizeChange={scrollMessagesToEnd} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" />
          <View style={[s.composer, compact && { paddingHorizontal: 12 }]}>
            <View style={s.inputRow}>
              <TextInput accessibilityLabel="Message Sofiya" value={text} onChangeText={setText}
                placeholder={voiceMode ? (partial || `Listening in ${language.name}…`) : `Message Sofiya in ${language.name}…`}
                placeholderTextColor="#85968d" style={s.input} multiline editable={!voiceMode} maxLength={4000} />
              <Pressable accessibilityRole="button" accessibilityLabel={voiceMode ? 'Stop voice mode' : text.trim() ? 'Send message' : 'Start voice mode'}
                style={({ pressed }) => [s.action, voiceMode && s.micOn, (pressed || (busy && !voiceMode)) && { opacity: 0.55 }]}
                onPress={voiceMode || !text.trim() ? toggleVoice : () => submit(text)} disabled={busy && !voiceMode}>
                <Ionicons name={voiceMode ? 'stop' : text.trim() ? 'arrow-up' : 'mic-outline'} size={22} color="#fff" />
              </Pressable>
            </View>
            <Text style={s.composerHint}>No perfect sentences needed. Just be yourself.</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, minHeight: 0, backgroundColor: '#eaf0eb' },
  shell: { flex: 1, minHeight: 0, width: '100%', maxWidth: 960, alignSelf: 'center', backgroundColor: '#fafbf8', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e0e8e0' },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12, borderBottomWidth: 1, borderColor: '#e7ece5', backgroundColor: '#fffefa' },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#256b59', alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 27, lineHeight: 31, fontWeight: '800', letterSpacing: -1, color: '#24473d' },
  caption: { fontSize: 10, color: '#73867b', marginTop: 2 },
  gear: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ed' },
  hero: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 26, gap: 18, backgroundColor: '#eff5ed' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, color: '#5b7c6b', marginBottom: 7 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, color: '#254b3e' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#55967a' },
  statusText: { color: '#6c8073', fontSize: 12, flexShrink: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e4eae1' },
  languagePickerWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, maxWidth: 240, minWidth: 0 },
  languagePicker: { flex: 1, height: 44, color: '#315b4a', backgroundColor: '#fafbf8', borderWidth: 0, fontSize: 14 },
  voiceToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, height: 44, borderRadius: 22, backgroundColor: '#e9f1e8' },
  voiceToggleText: { color: '#316b5d', fontSize: 12, fontWeight: '600' },
  voiceOn: { backgroundColor: '#316b5d' },
  chatArea: { flex: 1, minHeight: 0 },
  list: { flex: 1, minHeight: 0 },
  messageListContent: { paddingHorizontal: 30, paddingTop: 22, paddingBottom: 18 },
  sessionLabel: { textAlign: 'center', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, color: '#8a998c', marginBottom: 22 },
  starters: { marginLeft: 44, marginTop: 12, gap: 8, maxWidth: 330 },
  starterLabel: { color: '#72816e', fontSize: 11, marginBottom: 5 },
  starter: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#dfe8dc', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: '#fffefa' },
  starterText: { flex: 1, color: '#496453', fontSize: 13 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  composer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 12, backgroundColor: '#fafbf8' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 8, borderWidth: 1, borderColor: '#d9e3d6', borderRadius: 23, backgroundColor: '#fff', shadowColor: '#314e37', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  input: { flex: 1, minHeight: 44, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: '#294335' },
  action: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f705b' },
  micOn: { backgroundColor: '#b3544e' },
  composerHint: { textAlign: 'center', color: '#72816e', fontSize: 10, marginTop: 9 },
  voiceBar: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#e8f1e4' },
  voiceBarText: { color: '#316b5d', fontSize: 13, fontWeight: '600' },
  voiceHint: { color: '#71876b', fontSize: 11, marginTop: 3 },
  error: { padding: 12, color: '#9b3737', backgroundColor: '#fff0ec', fontSize: 12 },
});
