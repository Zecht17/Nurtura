import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface JoinCareSpaceModalProps {
    visible: boolean;
    initialCode?: string;
    onClose: () => void;
    onJoin?: (code: string) => Promise<void> | void;
}

export default function JoinCareSpaceModal({
    visible,
    initialCode = "",
    onClose,
    onJoin,
}: JoinCareSpaceModalProps) {
    const [code, setCode] = React.useState(initialCode);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (visible) {
            setCode(initialCode);
            setSubmitting(false);
            setError(null);
        }
    }, [visible, initialCode]);

    const handleJoin = async () => {
        const normalizedCode = code.trim();

        if (!normalizedCode) {
            setError("Care space code is required.");
            return;
        }

        if (!onJoin) {
            setError("Join action is unavailable right now.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onJoin(normalizedCode);
        } catch (joinError) {
            const message = joinError instanceof Error ? joinError.message : "Unable to join care space right now.";
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

                    <Text style={styles.title}>Join a Care Space</Text>
                    <Text style={styles.subtitle}>Enter the invite code shared with you</Text>

                    <Text style={styles.label}>Care Space Code</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={code}
                            onChangeText={setCode}
                            placeholder="ABC-DEF"
                            placeholderTextColor="#999"
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                    </View>

                    <Text style={styles.helpText}>Ask the care space owner for the invite code</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Pressable onPress={handleJoin} style={styles.ctaWrapper} disabled={submitting}>
                        <LinearGradient
                            colors={["#7C6FDC", "#9C88F2"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.ctaButton, submitting ? styles.ctaButtonDisabled : null]}
                        >
                            <Text style={styles.ctaText}>{submitting ? "Joining..." : "Join Care Space"}</Text>
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
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
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
    },
    input: {
        fontSize: 18,
        letterSpacing: 2,
        color: "#333",
        fontWeight: "600",
        paddingVertical: 8,
    },
    helpText: {
        fontSize: 12,
        color: "#777",
        marginTop: 10,
        lineHeight: 18,
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
        marginTop: 10,
        textAlign: "center",
    },
});
