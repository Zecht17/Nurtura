import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

type NoPendingTaskProps = {
    title?: string;
    subtitle?: string;
};

export default function NoPendingTask({
    title = "No pending tasks",
    subtitle = "You're all caught up! Create a new task to get started.",
}: NoPendingTaskProps) {
    return (
        <View style={styles.card}>
            <Ionicons name="time-outline" size={48} color="#8F99A7" style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {/* <AddTaskButton style={styles.addButton} /> */}
        </View>
    );
}

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
