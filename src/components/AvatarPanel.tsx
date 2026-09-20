import { View, Text, StyleSheet } from 'react-native';

export function AvatarPanel({
    robot,
    label,
    children,
}: {
    robot?: boolean;
    label: string;
    children?: React.ReactNode;
}) {
    return (
        <View style={s.wrap}>
            <View style={[s.avatar, robot && s.robot]}>
                {children ?? (
                    robot ? (
                        <View style={s.robotFace}>
                            <View style={s.antenna} />
                            <View style={s.head}>
                                <View style={s.eyeRow}>
                                    <View style={s.eye} />
                                    <View style={s.eye} />
                                </View>
                                <View style={s.mouth} />
                            </View>
                        </View>
                    ) : (
                        <Text style={s.icon}>🙂</Text>
                    )
                )}
            </View>
            <Text style={s.label}>{label}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        flex: 1,
        minWidth: 0
    },
    avatar: {
        width: '100%',
        height: 112,
        borderRadius: 22,
        backgroundColor: '#dbeafe',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#bfdbfe'
    },
    robot: {
        backgroundColor: '#ede9fe',
        borderColor: '#c4b5fd'
    },
    robotFace: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    antenna: {
        width: 8,
        height: 18,
        backgroundColor: '#7c3aed',
        borderRadius: 6,
        marginBottom: 4
    },
    head: {
        width: 92,
        height: 92,
        backgroundColor: '#8b5cf6',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#6d28d9'
    },
    eyeRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12
    },
    eye: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff'
    },
    mouth: {
        width: 38,
        height: 10,
        borderRadius: 8,
        backgroundColor: '#d8b4fe'
    },
    icon: {
        fontSize: 54
    },
    label: {
        fontWeight: '700',
        marginTop: 5,
        color: '#111827',
        fontSize: 12
    }
});
