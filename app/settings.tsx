import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { getResponsiveTokens } from "../utils/responsive";

const formatDate = (value?: string) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function SettingsPage() {
	const router = useRouter();
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const { logout } = useAuth();
    const { profileData, profileLoading, profileError } = useUser();

    const fullName = useMemo(() => {
        if (!profileData) {
            return "-";
        }

        return [profileData.first_name, profileData.middle_name, profileData.last_name]
            .filter(Boolean)
            .join(" ");
    }, [profileData]);

    const handleLogout = async () => {
        try {
            await logout();  // now this will work
            router.push("/login");
        } catch (err) {
            console.log("Logout failed:", err);
        }
    };

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={settings.gradient}>
        <SafeAreaView style={[settings.container, { maxWidth: tokens.containerMaxWidth, alignSelf: "center", width: "100%", padding: tokens.pagePadding }] }>
            <View style={settings.headerContainer}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Feather name="arrow-left" size={24} color="black" />
                </Pressable>
                <View>
                    <Text style={[settings.headerTitle, { fontSize: tokens.title }]}>Settings</Text>
                    <Text style={[settings.subHeader, { fontSize: tokens.subtitle }]}>Manage your account and preferences</Text>
                </View>
            </View>

            <View style={settings.accInfoContainer}>
                <Text style={[settings.accInfoTitle, { fontSize: tokens.subtitle }]}>Account Information</Text>
                <Text style={[settings.accInfoSubTitle, { fontSize: tokens.body }]}>Your personal details</Text>

                {profileLoading ? (
                    <View style={settings.feedbackRow}>
                        <ActivityIndicator size="small" color="#7C6FDC" />
                        <Text style={[settings.feedbackText, { fontSize: tokens.body }]}>Loading account data...</Text>
                    </View>
                ) : null}

                {profileError ? (
                    <Text style={[settings.errorText, { fontSize: tokens.chipText }]}>{profileError}</Text>
                ) : null}

                {/* This is for the user information */}
                <View style={{ paddingBottom: 15 }}>
                    <Text style={[settings.accCredTitle, { fontSize: tokens.subtitle }]}>Name:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={[settings.accCredInfo, { fontSize: tokens.body }]}>{fullName}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[settings.accCredTitle, { fontSize: tokens.subtitle }]}>Email:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={[settings.accCredInfo, { fontSize: tokens.body }]}>{profileData?.email || "-"}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[settings.accCredTitle, { fontSize: tokens.subtitle }]}>Member Since:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={[settings.accCredInfo, { fontSize: tokens.body }]}>{formatDate(profileData?.created_at)}</Text>
                    </View>
                </View>
            </View>

            <View style={settings.accInfoContainer}>
                <Text style={[settings.accInfoTitle, { fontSize: tokens.subtitle }]}>Account Management</Text>
                <Text style={[settings.accInfoSubTitle, { fontSize: tokens.body }]}>Manage your profile and account settings</Text>
                <Pressable style={settings.editButton} onPress={() => router.push("/profileAndAccount")}>
                    <View style={settings.editButtonLeft}>
                        <Ionicons name="person-outline" size={16} color="#111" />
                        <Text style={[settings.editButtonText, { fontSize: tokens.menuText }]} numberOfLines={1}>Profile & Account</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={14} color="#111" />
                </Pressable>
            </View>
            
            {/* Logout button */}
            <Pressable style={settings.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={18} color="white" />
                <Text style={[settings.logoutButtonText, { fontSize: tokens.subtitle }]}>Logout</Text>
            </Pressable>

        </SafeAreaView>
    </LinearGradient>
  )
}

const settings = StyleSheet.create({
    gradient: {
        flex: 1,
    },

    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
        paddingBottom: 0,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 15,
        paddingBottom: 0,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },


    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    accInfoContainer: {
        marginTop: 20,
        // padding: 20,
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
    },

    accInfoTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginTop: 5,
        marginBottom: 4,
    },

    accInfoSubTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },

    inputContainer: {
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "flex-start",
    },

    accCredTitle: {
        fontSize: 16,
        color: "black",
        fontWeight: "500",
        // paddingHorizontal: 15,
        paddingBottom: 5,
    },

    accCredInfo: {
        fontSize: 15,
        color: "#333",
        paddingHorizontal: 8,
        // paddingBottom: 15,

    },

    feedbackRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },

    feedbackText: {
        color: "#4b4b4b",
        fontSize: 14,
    },

    errorText: {
        color: "#b91c1c",
        marginBottom: 12,
        fontSize: 13,
    },

    editButton: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#bebebe",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 5,
    },

    editButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    editButtonText: {
        color: "#000000",
        fontWeight: "500",
        fontSize: 15,
    },

    logoutButton: {
        backgroundColor: "#FF0000",
        // borderWidth: 1,
        // borderColor: "#bebebe",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        marginTop: 15,
    },

    logoutButtonText: {
        color: "white",
        fontWeight: "500",
        fontSize: 18,
    },

});
