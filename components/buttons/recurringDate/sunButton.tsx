import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

type SunButtonProps = {
    style?: StyleProp<ViewStyle>;
    selected?: boolean;
    onPress?: () => void;
};

export default function SunButton({ style, selected = false, onPress }: SunButtonProps) {
    return (
        <Pressable style={({ pressed }) => [
            styles.card,
            selected && styles.cardSelected,
            { opacity: pressed ? 0.5 : 1 },
            style,
        ]}
            onPress={onPress}
        >
            <Text style={[styles.dateText, selected && styles.dateTextSelected]}>Sun</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardSelected: {
        backgroundColor: "#7C6FDC",
    },
    dateText: {
        color: "#000000",
        fontSize: 14,
    },
    dateTextSelected: {
        color: "#ffffff",
    },
});
