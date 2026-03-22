import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type InviteRole = "Viewer" | "Editor";

interface ManageAccessModalProps {
    visible: boolean;
    memberName?: string;
    initialRole?: InviteRole;
    onClose: () => void;
    onSaveAccess?: (payload: { role: InviteRole }) => Promise<void> | void;
    onRemoveMember?: () => Promise<void> | void;
}

export default function ManageAccessModal({
    visible,
    memberName,
    initialRole = "Viewer",
    onClose,
    onSaveAccess,
    onRemoveMember,
}: ManageAccessModalProps) {
    const [role, setRole] = React.useState<InviteRole>(initialRole);
    const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
    const [busyAction, setBusyAction] = React.useState<"save" | "remove" | null>(null);
    const [errorText, setErrorText] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (visible) {
            setRole(initialRole);
            setRoleMenuOpen(false);
            setBusyAction(null);
            setErrorText(null);
        }
    }, [visible, initialRole, memberName]);

    const handleSaveAccess = async () => {
        if (!onSaveAccess) {
            return;
        }

        try {
            setBusyAction("save");
            setErrorText(null);
            await onSaveAccess({ role });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update member access.";
            setErrorText(message);
        } finally {
            setBusyAction(null);
        }
    };

    const handleRemoveMember = async () => {
        if (!onRemoveMember) {
            return;
        }

        try {
            setBusyAction("remove");
            setErrorText(null);
            await onRemoveMember();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to remove member.";
            setErrorText(message);
        } finally {
            setBusyAction(null);
        }
    };

    const isBusy = busyAction !== null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <FontAwesome6 name="xmark" size={16} color="#666" />
                    </Pressable>

                    <Text style={styles.title}>Manage Access</Text>
                    <Text style={styles.subtitle}>
                        {memberName ? `Update access for ${memberName}` : "Choose whether this user can view or edit"}
                    </Text>

                    <Text style={styles.label}>User&apos;s Role</Text>

                    <Pressable
                        style={styles.roleSelect}
                        onPress={() => setRoleMenuOpen((prev) => !prev)}
                        disabled={isBusy}
                    >
                        <Text style={styles.roleText}>{role}</Text>
                        <Feather name={roleMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#111" />
                    </Pressable>

                    <Text style={styles.helperText}>Select the access of this user.</Text>

                    {roleMenuOpen ? (
                        <View style={styles.roleMenu}>
                            <Pressable
                                style={styles.roleOption}
                                onPress={() => {
                                    setRole("Viewer");
                                    setRoleMenuOpen(false);
                                }}
                                disabled={isBusy}
                            >
                                <Text style={styles.roleOptionText}>Viewer</Text>
                            </Pressable>
                            <Pressable
                                style={styles.roleOption}
                                onPress={() => {
                                    setRole("Editor");
                                    setRoleMenuOpen(false);
                                }}
                                disabled={isBusy}
                            >
                                <Text style={styles.roleOptionText}>Editor</Text>
                            </Pressable>
                        </View>
                    ) : null}

                    {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

                    <View style={styles.actionRow}>
                        <Pressable onPress={handleSaveAccess} style={styles.actionButton} disabled={isBusy}>
                            <LinearGradient
                                colors={["#7C6FDC", "#A884D6"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>{busyAction === "save" ? "Saving..." : "Save Access"}</Text>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.removeButton, isBusy ? styles.disabledButton : null]}
                            onPress={handleRemoveMember}
                            disabled={isBusy}
                        >
                            <Text style={styles.removeButtonText}>{busyAction === "remove" ? "Removing..." : "Remove Member"}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        width: "100%",
        maxWidth: 360,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        padding: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
        marginTop: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 18,
        lineHeight: 20,
    },
    label: {
        fontSize: 13,
        color: "#444",
        marginBottom: 8,
        marginTop: 4,
    },
    roleSelect: {
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    roleText: {
        fontSize: 16,
        color: "#666",
    },
    helperText: {
        marginTop: 10,
        color: "#666",
        fontSize: 13,
        lineHeight: 18,
    },
    errorText: {
        marginTop: 10,
        color: "#c0392b",
        fontSize: 13,
        lineHeight: 18,
    },
    roleMenu: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e9e9e9",
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    roleOption: {
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    roleOptionText: {
        fontSize: 18,
        color: "#333",
    },
    actionRow: {
        marginTop: 18,
        flexDirection: "row",
        gap: 14,
    },
    actionButton: {
        flex: 1,
    },
    saveButton: {
        borderRadius: 12,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
    },
    removeButton: {
        minHeight: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e60012",
    },
    disabledButton: {
        opacity: 0.65,
    },
    removeButtonText: {
        color: "#ffffff",
        fontSize: 16,
    },
});
