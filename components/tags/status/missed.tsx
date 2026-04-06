import { StyleSheet, Text, View } from "react-native";

export default function MissedStatus() {
    return (
        <View style={styles.missed}>
            <Text style={styles.missedText} allowFontScaling={false}>Missed</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    missed: {
        backgroundColor: "#FFE2E2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    missedText: {
        color: "#C10007",
        fontSize: 12,
        flexShrink: 1,
    },
});
