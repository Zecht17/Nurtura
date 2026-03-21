import ViewerBadge from "@/components/tags/roles/viewer";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ViewerRoleCardProps {
    name: string;
    email?: string;
    initial?: string;
    dependentStyle?: boolean;
    onPress?: () => void;
}

export default function ViewerRoleCard({
    name,
    email,
    initial,
    dependentStyle = false,
    onPress,
}: ViewerRoleCardProps) {
    const avatarLetter = (initial?.trim()?.charAt(0) || name.trim().charAt(0) || "?").toUpperCase();

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.row}>
                <View style={styles.leftSide}>
                    <View style={[styles.avatar, dependentStyle ? styles.dependentAvatar : null]}>
                        <Text style={styles.avatarText}>{avatarLetter}</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.name}>{name}</Text>
                        {email ? <Text style={styles.email}>{email}</Text> : null}
                    </View>
                </View>
                <ViewerBadge />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 8,
    },
    leftSide: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 1,
    },
    avatar: {
        backgroundColor: "#7C6FDC",
        width: 40,
        height: 40,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    dependentAvatar: {
        backgroundColor: "#9B6CF0",
    },
    avatarText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    details: {
        flexDirection: "column",
        gap: 4,
        flexShrink: 1,
    },
    name: {
        fontSize: 16,
        color: "#333",
    },
    email: {
        fontSize: 14,
        color: "#777",
    },
});