import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
	const router = useRouter();
    const firstName = "Juztine"; // TODO: Get from user context or auth
    const lastName = "Miguel"; // TODO: Get from user context or auth
    const email = "juztine.miguel@example.com"; // TODO: Get from user context or auth
    const joinDate = "January 18, 2026"; // TODO: Get from user context or auth

    const { logout } = useAuth();

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
        <SafeAreaView style={settings.container}>
            <View style={settings.headerContainer}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Feather name="arrow-left" size={24} color="black" />
                </Pressable>
                <View>
                    <Text style={settings.headerTitle}>Settings</Text>
                    <Text style={settings.subHeader}>Manage your account and preferences</Text>
                </View>
            </View>

            <View style={settings.accInfoContainer}>
                <Text style={settings.accInfoTitle}>Account Information</Text>
                <Text style={settings.accInfoSubTitle}>Your personal details</Text>
                {/* This is for the user information */}
                <View style={{ paddingBottom: 15 }}>
                    <Text style={settings.accCredTitle}>Name:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={settings.accCredInfo}>{firstName} {lastName}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={settings.accCredTitle}>Email:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={settings.accCredInfo}>{email}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={settings.accCredTitle}>Member Since:</Text>
                    <View style={settings.inputContainer}>
                        <Text style={settings.accCredInfo}>{joinDate}</Text>
                    </View>
                </View>
            </View>

            <View style={settings.accInfoContainer}>
                <Text style={settings.accInfoTitle}>Account Management</Text>
                <Text style={settings.accInfoSubTitle}>Manage your profile and account settings</Text>
                <Pressable style={settings.editButton} onPress={() => router.push("/profileAndAccount")}>
                    <View style={settings.editButtonLeft}>
                        <Ionicons name="person-outline" size={16} color="#111" />
                        <Text style={settings.editButtonText}>Profile & Account</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={14} color="#111" />
                </Pressable>
            </View>
            
            {/* Logout button */}
            <Pressable style={settings.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={18} color="white" />
                <Text style={settings.logoutButtonText}>Logout</Text>
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
