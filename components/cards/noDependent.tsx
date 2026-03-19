import Octicons from "@expo/vector-icons/Octicons";
import { StyleSheet, Text, View } from "react-native";

export function NoDependentCard() {
    return (
        <View style={styles.card}>
            <Octicons name="person" size={48} color="#8F99A7" style={styles.icon} />
            <Text style={styles.title}>No dependents added</Text>
            <Text style={styles.subtitle}>
                You haven't added any dependents yet. Add a new dependent to get started.
            </Text>
            {/* <AddTaskButton style={styles.addButton} /> */}
        </View>
    );
}

export default NoDependentCard;

const styles = StyleSheet.create({
    card: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    icon: {
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
    },
    addButton: {
        marginTop: 8,
    },
});
