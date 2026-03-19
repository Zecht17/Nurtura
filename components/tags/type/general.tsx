import { StyleSheet, Text, View } from "react-native";

export default function GeneralTypeTag() {
    return (
        <View style={styles.type}>
            <Text style={styles.childText}>General</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    type: {
        backgroundColor: "#7C6FDC",
        width: 60,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    childText: {
        color: "#ffffff",
        fontSize: 14,
    },
});
