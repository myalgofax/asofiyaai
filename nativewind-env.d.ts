/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
    interface ViewProps {
        className?: string;
    }

    interface FlatListProps<ItemT> {
        className?: string;
    }
}
