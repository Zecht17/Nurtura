import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MoreFeaturesModalProps = {
    visible: boolean;
    onClose: () => void;
};

type FeatureItem = {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    route?: string;
};

const FEATURES: FeatureItem[] = [
    {
        title: "Voice Alerts",
        subtitle: "Send urgent voice messages",
        icon: <Feather name="mic" size={22} color="#7C6FDC" />,
        route: undefined,
    },
    {
        title: "Dependent Profile",
        subtitle: "Manage dependent information and preferences",
        icon: <Ionicons name="people-outline" size={22} color="#7C6FDC" />,
        route: "/dependentProfile",
    },
    {
        title: "AI Assistant",
        subtitle: "Get personalized help",
        icon: <Ionicons name="sparkles-outline" size={22} color="#7C6FDC" />,
        route: "/aiChat",
    },
    {
        title: "Settings",
        subtitle: "Account & preferences",
        icon: <Feather name="settings" size={22} color="#7C6FDC" />,
        route: undefined,
    },
];

export default function MoreFeaturesModal({ visible, onClose }: MoreFeaturesModalProps) {
    const insets = useSafeAreaInsets();

    const handleNavigate = (route?: string) => {
        if (!route) return;
        router.push(route);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheetContainer}>
                    <View style={[styles.card, { paddingBottom: insets.bottom + 12 }]}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>More Features</Text>
                        <Pressable hitSlop={12} onPress={onClose}>
                            <AntDesign name="close" size={20} color="#111" />
                        </Pressable>
                    </View>

                        <ScrollView contentContainerStyle={styles.list}>
                            {FEATURES.map((item) => (
                                <Pressable
                                    key={item.title}
                                    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                                    onPress={() => handleNavigate(item.route)}
                                >
                                    <View style={styles.iconPill}>{item.icon}</View>
                                    <View style={styles.textGroup}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
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
        paddingHorizontal: 0,
    },
    card: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 12,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111",
    },
    list: {
        gap: 10,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 14,
        // backgroundColor: "#F7F4FF",
        borderWidth: 1,
        borderColor: "#E8E3FF",
    },
    itemPressed: {
        backgroundColor: "#F7F4FF",
    },
    iconPill: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: "#EFE9FF",
        justifyContent: "center",
        alignItems: "center",
    },
    textGroup: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1B1338",
    },
    itemSubtitle: {
        fontSize: 13,
        color: "#5B5676",
        marginTop: 2,
    },
});