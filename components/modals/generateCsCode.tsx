import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type InviteRole = "Viewer" | "Editor";

interface GenerateCsCodeModalProps {
    visible: boolean;
    initialCode?: string;
    initialRole?: InviteRole;
    onClose: () => void;
    onGenerate?: (payload: { role: InviteRole }) => Promise<string | void> | string | void;
}

export default function GenerateCsCodeModal({
    visible,
    initialCode = "",
    initialRole = "Viewer",
    onClose,
    onGenerate,
}: GenerateCsCodeModalProps) {
    const [code, setCode] = React.useState(initialCode);
    const [role, setRole] = React.useState<InviteRole>(initialRole);
    const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
    const [isCodeInputActive, setIsCodeInputActive] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            setCode(initialCode);
            setRole(initialRole);
            setRoleMenuOpen(false);
            setIsCodeInputActive(false);
            setSubmitting(false);
            setError(null);
            setCopied(false);
        }
    }, [visible, initialCode, initialRole]);

    const handleCopyCode = async () => {
        if (!code || code.trim().length === 0) {
            return;
        }

        await Clipboard.setStringAsync(code.trim());
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1200);
    };

    const handleGenerate = async () => {
        if (!onGenerate) {
            setError("Invite generation is unavailable right now.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const generatedCode = await onGenerate({ role });

            if (!generatedCode || generatedCode.trim().length === 0) {
                throw new Error("No invite code returned by the server.");
            }

            setCode(generatedCode);
            setIsCodeInputActive(true);
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : "Unable to generate code right now.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

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

                    <Text style={styles.title}>Generate Care Space Code</Text>
                    <Text style={styles.subtitle}>Choose a role for the person you'd like to invite to this Care Space.</Text>

                    <Text style={styles.label}>Care Space Code</Text>

                    <View style={styles.inputWrapper}>
                        {isCodeInputActive ? (
                            <TextInput
                                value={code}
                                onChangeText={setCode}
                                placeholder="ABC-DEF"
                                placeholderTextColor="#999"
                                style={styles.input}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                keyboardType="default"
                            />
                        ) : (
                            <View pointerEvents="none" style={styles.inputDisabledWrapper}>
                                <Text style={[styles.input, styles.inputDisabled]}>{code || "ABC-DEF"}</Text>
                            </View>
                        )}

                        <Pressable
                            style={[styles.copyButton, (!code || submitting) && styles.copyButtonDisabled]}
                            onPress={handleCopyCode}
                            disabled={!code || submitting}
                        >
                            <Feather name={copied ? "check" : "copy"} size={16} color="#4c1d95" />
                        </Pressable>
                    </View>

                    <Text style={[styles.label, styles.roleLabel]}>Role</Text>

                    <Pressable style={styles.roleSelect} onPress={() => setRoleMenuOpen((prev) => !prev)}>
                        <Text style={styles.roleText}>{role}</Text>
                        <Feather name={roleMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#111" />
                    </Pressable>

                    {roleMenuOpen ? (
                        <View style={styles.roleMenu}>
                            <Pressable
                                style={styles.roleOption}
                                onPress={() => {
                                    setRole("Viewer");
                                    setRoleMenuOpen(false);
                                }}
                            >
                                <Text style={styles.roleOptionText}>Viewer</Text>
                            </Pressable>
                            <Pressable
                                style={styles.roleOption}
                                onPress={() => {
                                    setRole("Editor");
                                    setRoleMenuOpen(false);
                                }}
                            >
                                <Text style={styles.roleOptionText}>Editor</Text>
                            </Pressable>
                        </View>
                    ) : null}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Pressable onPress={handleGenerate} style={styles.ctaWrapper} disabled={submitting}>
                        <LinearGradient
                            colors={["#7C6FDC", "#9C88F2"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.ctaButton, submitting ? styles.ctaButtonDisabled : null]}
                        >
                            <Text style={styles.ctaText}>{submitting ? "Generating..." : "Generate Code"}</Text>
                        </LinearGradient>
                    </Pressable>
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
    inputWrapper: {
        borderRadius: 12,
        backgroundColor: "#f8f8f8",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        paddingHorizontal: 14,
        paddingVertical: 2,
        minHeight: 48,
        justifyContent: "center",
        alignItems: "stretch",
        position: "relative",
    },
    input: {
        width: "100%",
        fontSize: 18,
        letterSpacing: 2,
        color: "#333",
        fontWeight: "600",
        paddingVertical: 8,
        textAlign: "center",
        paddingHorizontal: 44,
    },
    inputDisabledWrapper: {
        width: "100%",
    },
    inputDisabled: {
        color: "#9aa0a6",
    },
    copyButton: {
        position: "absolute",
        right: 8,
        top: 7,
        backgroundColor: "#ffffff",
        borderColor: "#e4e4e7",
        borderWidth: 1,
        borderRadius: 10,
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
    },
    copyButtonDisabled: {
        opacity: 0.45,
    },
    roleLabel: {
        marginTop: 16,
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
    ctaWrapper: {
        marginTop: 18,
    },
    ctaButton: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    ctaButtonDisabled: {
        opacity: 0.65,
    },
    ctaText: {
        color: "#ffffff",
        fontSize: 16,
        // fontWeight: "700",
    },
    errorText: {
        color: "#D14343",
        fontSize: 14,
        marginTop: 12,
        textAlign: "center",
    },
});
