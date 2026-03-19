import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChangePasswordModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void> | void;
};

export default function ChangePasswordModal({ visible, onClose, onSubmit }: ChangePasswordModalProps) {
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFormError(null);
        setIsSubmitting(false);
    }, [visible]);

    const handleUpdate = async () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setFormError("All password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormError("New password and confirm password do not match.");
            return;
        }

        setFormError(null);
        setIsSubmitting(true);

        try {
            await onSubmit?.({ currentPassword, newPassword, confirmPassword });
            onClose();
        } catch (err) {
            setFormError((err as Error).message || "Unable to change password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
                <View style={styles.backdrop}>
                    <View style={styles.sheetContainer}>
                        <View style={[styles.card, { paddingBottom: 20 + insets.bottom }]}> 
                            <Text style={styles.title}>Security</Text>
                            <Text style={styles.subtitle}>Manage your password and security settings</Text>

                            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

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
                                        editable={!isSubmitting}
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
                                        editable={!isSubmitting}
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
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.buttonRow}>
                                <Pressable style={styles.secondaryButton} onPress={onClose} disabled={isSubmitting}>
                                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]} onPress={handleUpdate} disabled={isSubmitting}>
                                    <Text style={styles.primaryButtonText}>{isSubmitting ? 'Updating...' : 'Update Password'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
    },
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
    errorText: {
        color: "#b91c1c",
        fontSize: 13,
        marginTop: 4,
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
    primaryButtonDisabled: {
        opacity: 0.7,
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