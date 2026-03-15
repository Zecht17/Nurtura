import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import DeactivateModal from '../components/modals/deactivateModal';
import ChangePasswordModal from '../components/modals/changePasswordModal';

export default function ProfileAndAccount() {
    const username = "Juztine17"; // TODO: Get from user context or auth
    const firstName = "Juztine"; // TODO: Get from user context or auth
    const lastName = "Miguel"; // TODO: Get from user context or auth
    const email = "juztine.miguel@example.com"; // TODO: Get from user context or auth
    const role = "Caregiver"; // TODO: Get from user context or auth
    const phone = "09123456789"; // TODO: Get from user context or auth
    const joinDate = "January 18, 2026"; // TODO: Get from user context or auth
    const router = useRouter();
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={profile.gradient}>
        <ScrollView>
        <SafeAreaView style={profile.container}>
            
            <View style={profile.headerContainer}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Feather name="arrow-left" size={24} color="black" />
                </Pressable>
                <View>
                    <Text style={profile.headerTitle}>Profile & Account</Text>
                    <Text style={profile.subHeader}>Manage your personal information {"\n"}and security profile</Text>
                </View>
            </View>

            <View style={profile.accInfoContainer}>
                <Text style={profile.accInfoTitle}>Personal Information</Text>
                <Text style={profile.accInfoSubTitle}>Your personal information and contact information</Text>

                {/* This is for the user information */}
                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Username:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="person-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{username}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>First Name:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="person-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{firstName}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Last Name:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="person-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{lastName}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Email:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="mail-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{email}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Role:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="shield-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{role}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Phone Number:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="call-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{phone}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={profile.accCredTitle}>Account Created:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="shield-outline" size={16} color="#7C6FDC" />
                        <Text style={profile.accCredInfo}>{joinDate}</Text>
                    </View>
                </View>
            </View>

            {/* Security Section */}
            <View style={profile.accInfoContainer}>
                <Text style={profile.accInfoTitle}>Security</Text>
                <Text style={profile.accInfoSubTitle}>Manage your password and security settings</Text>
                <Pressable style={profile.editButton} onPress={() => setShowChangePassword(true)}>
                        <Ionicons name="shield-outline" size={16} color="#111" />
                        <Text style={profile.editButtonText}>Change Password</Text>
                </Pressable>
            </View>

            <View style={profile.accInfoContainerDanger}>
                <Text style={profile.accInfoTitle}>Danger Zone</Text>
                <Text style={profile.accInfoSubTitle}>Irreversible account actions</Text>
                <Pressable style={profile.dangerButton} onPress={() => setShowDeactivate(true)}>
                        <AntDesign name="exclamation-circle" size={16} color="white" />
                        <Text style={profile.dangerButtonText}>Deactivate Account</Text>
                </Pressable>
            </View>

            <DeactivateModal
                visible={showDeactivate}
                onConfirm={() => {
                    setShowDeactivate(false);
                    // TODO: Add deactivate logic
                }}
                onCancel={() => setShowDeactivate(false)}
            />

            <ChangePasswordModal
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                onSubmit={() => {
                    setShowChangePassword(false);
                    // TODO: Hook up password change logic
                }}
            />
            
        </SafeAreaView>
        </ScrollView>
    </LinearGradient>
  )
}

const profile = StyleSheet.create({
    gradient: {
        flex: 1,
    },

    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
        // paddingBottom: 0,
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

    accInfoContainerDanger: {
        marginTop: 20,
        // padding: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ff4d4d",
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
        flexDirection: "row",
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        justifyContent: "flex-start",
        alignItems: "center",
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
        fontWeight: "400",
        // paddingBottom: 15,

    },

    editButton: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#bebebe",
        gap: 10,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 5,
    },

    editButtonText: {
        color: "#000000",
        fontWeight: "500",
        fontSize: 15,
    },

    dangerButton: {
        backgroundColor: "#ff4d4d",
        gap: 10,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 5,
    },

    dangerButtonText: {
        color: "#ffffff",
        fontWeight: "500",
        fontSize: 15,
    },
});