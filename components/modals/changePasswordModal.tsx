import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChangePasswordModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
};

export default function ChangePasswordModal({ visible, onClose, onSubmit }: ChangePasswordModalProps) {
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdate = () => {
        onSubmit?.({ currentPassword, newPassword, confirmPassword });
        // Keep modal behavior simple; close after submit for now
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheetContainer}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Security</Text>
                        <Text style={styles.subtitle}>Manage your password and security settings</Text>

                        <ScrollView contentContainerStyle={styles.form}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#7c7a87"
                                    secureTextEntry
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#7c7a87"
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Re-enter new password"
                                    placeholderTextColor="#7c7a87"
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.buttonRow}>
                            <Pressable style={styles.primaryButton} onPress={handleUpdate}>
                                <Text style={styles.primaryButtonText}>Update Password</Text>
                            </Pressable>
                            <Pressable style={styles.secondaryButton} onPress={onClose}>
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },
    sheetContainer: {
        width: "100%",
    },
    card: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        gap: 14,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: -2,
    },
    form: {
        gap: 14,
        paddingTop: 6,
    },
    fieldGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        color: "#1f1f25",
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e8e6f2",
        backgroundColor: "#f6f4ff",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 15,
        color: "#111",
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 4,
    },
    primaryButton: {
        backgroundColor: "#7C6FDC",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    secondaryButton: {
        backgroundColor: "#f5f5ff",
        borderWidth: 1,
        borderColor: "#e6e6f3",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        flex: 0.9,
    },
    secondaryButtonText: {
        color: "#333",
        fontWeight: "600",
        fontSize: 15,
    },
});