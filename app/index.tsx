import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LANGUAGES } from '@/constants/languages';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
    return <Redirect href="/chat" />;
    /*
    const { language, setLanguage } = useLanguage();

    return (
        <SafeAreaView style={s.page}>
            <View style={s.glowA} />
            <View style={s.glowB} />

            <View style={s.container}>
                <View style={s.headerRow}>
                    <Text style={s.brand}>Lingua Robot</Text>
                    <View style={s.pill}>
                        <Text style={s.pillText}>AI Tutor</Text>
                    </View>
                </View>

                <View style={s.heroCard}>
                    <Text style={s.badge}>Speak • Learn • Repeat</Text>
                    <Text style={s.title}>Pick your target language</Text>
                    <Text style={s.sub}>Choose the language you want to practice today and begin your conversation.</Text>

                    <View style={s.selectorCard}>
                        <Text style={s.label}>Learning target</Text>
                        <View style={s.dropdownWrap}>
                            <Picker
                                selectedValue={language.code}
                                onValueChange={(value) => {
                                    const selected = LANGUAGES.find((item) => item.code === value);
                                    if (selected) setLanguage(selected);
                                }}
                                style={s.picker}
                                itemStyle={s.pickerItem}
                                dropdownIconColor="#1F2937"
                            >
                                {LANGUAGES.map((item) => (
                                    <Picker.Item
                                        key={item.code}
                                        label={`${item.emoji} ${item.name}`}
                                        value={item.code}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={s.selectedBox}>
                        <View style={s.flagWrap}>
                            <Text style={s.selectedFlag}>{language.emoji}</Text>
                        </View>
                        <View style={s.selectedTextWrap}>
                            <Text style={s.selectedTitle}>Selected language</Text>
                            <Text style={s.selectedName}>{language.name}</Text>
                        </View>
                    </View>

                    <View style={s.metaRow}>
                        <View style={s.metaItem}>
                            <Text style={s.metaIcon}>🎧</Text>
                            <Text style={s.metaText}>Voice practice</Text>
                        </View>
                        <View style={s.metaItem}>
                            <Text style={s.metaIcon}>🧠</Text>
                            <Text style={s.metaText}>Smart correction</Text>
                        </View>
                    </View>
                </View>

                <Pressable style={s.go} onPress={() => router.push('/chat')}>
                    <Text style={s.goText}>Start practicing {language.name}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    ); */
}

const s = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#eef4ff',
        position: 'relative'
    },
    glowA: {
        position: 'absolute',
        top: -50,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#c7d2fe',
        opacity: 0.7
    },
    glowB: {
        position: 'absolute',
        bottom: 80,
        left: -50,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#bfdbfe',
        opacity: 0.7
    },
    container: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 28,
        paddingBottom: 18,
        justifyContent: 'center'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        zIndex: 2
    },
    brand: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827'
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: '#dbeafe',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#bfdbfe'
    },
    pillText: {
        color: '#1d4ed8',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase'
    },
    heroCard: {
        backgroundColor: '#ffffff',
        borderRadius: 30,
        padding: 22,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.12,
        shadowRadius: 22,
        elevation: 9,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 2
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#dbeafe',
        color: '#1d4ed8',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        overflow: 'hidden'
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#111827',
        marginTop: 18,
        letterSpacing: -1
    },
    sub: {
        fontSize: 15,
        color: '#6b7280',
        marginTop: 10,
        lineHeight: 22
    },
    selectorCard: {
        marginTop: 24,
        backgroundColor: '#f8fafc',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    label: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4
    },
    dropdownWrap: {
        borderWidth: 1,
        borderColor: '#dbe1ea',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#ffffff'
    },
    picker: {
        height: 58,
        width: '100%',
        backgroundColor: '#ffffff'
    },
    pickerItem: {
        fontSize: 18,
        color: '#111827'
    },
    selectedBox: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#bfdbfe'
    },
    flagWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dbeafe'
    },
    selectedFlag: {
        fontSize: 26
    },
    selectedTextWrap: {
        flex: 1
    },
    selectedTitle: {
        fontSize: 11,
        color: '#1d4ed8',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.7
    },
    selectedName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginTop: 2
    },
    metaRow: {
        marginTop: 18,
        flexDirection: 'row',
        gap: 10
    },
    metaItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    metaIcon: {
        fontSize: 15
    },
    metaText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155'
    },
    go: {
        marginTop: 20,
        backgroundColor: '#2563eb',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 6,
        zIndex: 2
    },
    goText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16
    }
});
