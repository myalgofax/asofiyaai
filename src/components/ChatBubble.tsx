import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/types/chat';
import { SofiyaAvatar } from './SofiyaAvatar';

export function ChatBubble({ m }: { m: ChatMessage }) {
  const mine = m.role === 'user';
  return (
    <View style={[s.row, mine && s.right]}>
      {!mine && <SofiyaAvatar size={32} />}
      <View style={[s.content, mine && { alignItems: 'flex-end' }]}>
        <Text style={s.name}>{mine ? 'YOU' : 'SOFIYA'}</Text>
        <View style={[s.bubble, mine ? s.mine : s.bot]}>
          <Text selectable style={[s.text, mine && s.textMine]}>{m.text}</Text>
          {m.correction && <View style={s.correction}>
            <Text style={s.ct}>A LITTLE LANGUAGE TIP</Text>
            <Text selectable style={s.original}>{m.correction.original}</Text>
            <Text selectable style={s.corrected}>{m.correction.corrected}</Text>
            <Text style={s.explain}>{m.correction.explanation}</Text>
          </View>}
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginVertical: 10 },
  right: { justifyContent: 'flex-end' },
  content: { maxWidth: '84%', flexShrink: 1 },
  name: { fontSize: 9, letterSpacing: 1.3, fontWeight: '700', color: '#7d8e7e', marginBottom: 7 },
  bubble: { paddingHorizontal: 18, paddingVertical: 15, borderRadius: 20, borderWidth: 1 },
  mine: { backgroundColor: '#316d59', borderColor: '#316d59', borderTopRightRadius: 5 },
  bot: { backgroundColor: '#fffefa', borderColor: '#e3e8dd', borderTopLeftRadius: 5 },
  text: { fontSize: 15, lineHeight: 24, color: '#344c3d' },
  textMine: { color: '#fff' },
  correction: { marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: '#f3f1df', borderLeftWidth: 3, borderColor: '#c5ac64' },
  ct: { fontSize: 9, letterSpacing: 1, fontWeight: '800', marginBottom: 9, color: '#8c7338' },
  original: { fontSize: 14, color: '#98766a', textDecorationLine: 'line-through', marginBottom: 5 },
  corrected: { fontSize: 14, lineHeight: 21, color: '#416b44', fontWeight: '600' },
  explain: { marginTop: 8, color: '#7a795c', fontSize: 12, lineHeight: 19 },
});
