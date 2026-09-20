import { View, StyleSheet } from 'react-native';

/** A lightweight, local illustration that works offline on native and web. */
export function SofiyaAvatar({ size = 80 }: { size?: number }) {
  return (
    <View accessibilityLabel="Sofiya, your AI language companion" accessible style={{ width: size, height: size, overflow: 'hidden', borderRadius: size / 2, backgroundColor: '#dceee7' }}>
      <View style={[s.canvas, { transform: [{ scale: size / 100 }], left: (size - 100) / 2, top: (size - 100) / 2 }]}>
        <View style={s.hair} />
        <View style={s.shoulders} />
        <View style={s.neck} />
        <View style={s.face}>
          <View style={[s.brow, { left: 9 }]} /><View style={[s.brow, { right: 9 }]} />
          <View style={[s.eye, { left: 12 }]} /><View style={[s.eye, { right: 12 }]} />
          <View style={[s.cheek, { left: 4 }]} /><View style={[s.cheek, { right: 4 }]} />
          <View style={s.nose} /><View style={s.smile} />
        </View>
        <View style={s.fringe} />
        <View style={s.clip} />
        <View style={[s.earring, { left: 25 }]} /><View style={[s.earring, { right: 25 }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  canvas: { position: 'absolute', width: 100, height: 100 },
  hair: { position: 'absolute', width: 64, height: 80, left: 18, top: 12, borderRadius: 32, backgroundColor: '#382c36' },
  shoulders: { position: 'absolute', width: 82, height: 45, left: 9, top: 79, borderRadius: 35, backgroundColor: '#257c70' },
  neck: { position: 'absolute', width: 17, height: 22, left: 42, top: 64, borderRadius: 8, backgroundColor: '#d99a79' },
  face: { position: 'absolute', width: 46, height: 54, left: 27, top: 25, borderRadius: 23, backgroundColor: '#efbc99' },
  fringe: { position: 'absolute', width: 47, height: 24, top: 15, left: 21, backgroundColor: '#382c36', borderTopLeftRadius: 25, borderBottomRightRadius: 30, transform: [{ rotate: '-18deg' }] },
  clip: { position: 'absolute', width: 12, height: 4, top: 30, right: 22, borderRadius: 3, backgroundColor: '#e8c786', transform: [{ rotate: '45deg' }] },
  brow: { position: 'absolute', width: 9, height: 2, top: 19, borderRadius: 2, backgroundColor: '#624337' },
  eye: { position: 'absolute', width: 4, height: 6, top: 24, borderRadius: 3, backgroundColor: '#382c36' },
  cheek: { position: 'absolute', width: 10, height: 5, top: 33, borderRadius: 5, backgroundColor: '#eaa18b' },
  nose: { position: 'absolute', width: 4, height: 6, top: 29, left: 21, borderBottomWidth: 1, borderColor: '#cc8c6e', borderRadius: 3 },
  smile: { position: 'absolute', width: 13, height: 7, top: 39, left: 17, backgroundColor: '#fff5e8', borderBottomLeftRadius: 9, borderBottomRightRadius: 9 },
  earring: { position: 'absolute', width: 4, height: 7, top: 59, borderRadius: 3, backgroundColor: '#ebca80' },
});
