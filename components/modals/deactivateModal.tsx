import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type DeactivateModalProps = {
    visible: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function DeactivateModal({ visible, loading = false, onConfirm, onCancel }: DeactivateModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Are you absolutely sure?</Text>
                    <Text style={styles.subtitle}>
                        This action will permanently delete your account. This cannot be undone.
                    </Text>

                    <Pressable style={[styles.deactivateButton, loading && styles.buttonDisabled]} onPress={onConfirm} disabled={loading}>
                        <Text style={styles.deactivateButtonText}>{loading ? 'Deleting...' : 'Delete Account'}</Text>
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
        maxWidth: 420,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        gap: 16,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        color: "#111",
    },
    subtitle: {
        fontSize: 14,
        color: "#444",
        textAlign: "center",
        lineHeight: 20,
    },
    boldText: {
        fontWeight: "700",
        color: "#111",
    },
    deactivateButton: {
        backgroundColor: "#e30016",
        borderRadius: 18,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    deactivateButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 16,
    },
    cancelButton: {
        borderRadius: 18,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eef0f8",
        backgroundColor: "#f7f8ff",
    },
    cancelButtonText: {
        color: "#333",
        fontWeight: "600",
        fontSize: 16,
    },
});
