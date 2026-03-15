import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type DeactivateModalProps = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function DeactivateModal({ visible, onConfirm, onCancel }: DeactivateModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Are you absolutely sure?</Text>
                    <Text style={styles.subtitle}>
                        This action will deactivate your account. You can reactivate it later by logging in again. All your data will be preserved.
                    </Text>

                    <Pressable style={styles.deactivateButton} onPress={onConfirm}>
                        <Text style={styles.deactivateButtonText}>Deactivate Account</Text>
                    </Pressable>

                    <Pressable style={styles.cancelButton} onPress={onCancel}>
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
