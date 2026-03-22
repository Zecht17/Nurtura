import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type CompleteTaskModalProps = {
    visible: boolean;
    taskTitle?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function CompleteTaskModal({ visible, taskTitle, loading, onConfirm, onCancel }: CompleteTaskModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Mark Task as Completed?</Text>
                    <Text style={styles.subtitle}>
                        Are you sure you want to mark <Text style={styles.boldText}>{taskTitle ? `"${taskTitle}"` : "this task"}</Text> as completed?
                    </Text>
                    <Pressable style={[styles.completeButton, loading && { opacity: 0.6 }]} onPress={onConfirm} disabled={loading}>
                        <Text style={styles.completeButtonText}>{loading ? "Saving…" : "Mark as Completed"}</Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={onCancel} disabled={loading}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#222",
    },
    subtitle: {
        fontSize: 16,
        color: "#444",
        marginBottom: 24,
        textAlign: "center",
    },
    boldText: {
        fontWeight: "bold",
        color: "#7C6FDC",
    },
    completeButton: {
        backgroundColor: "#7C6FDC",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginBottom: 12,
        width: "100%",
        alignItems: "center",
    },
    completeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: "#f2f2f2",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
        width: "100%",
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#7C6FDC",
        fontWeight: "bold",
        fontSize: 16,
    },
});
