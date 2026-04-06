import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChangePasswordModal from '../components/modals/changePasswordModal';
import DeactivateModal from '../components/modals/deactivateModal';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getResponsiveTokens } from '../utils/responsive';

const formatDate = (value?: string) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const toDisplayRole = (value?: string) => {
    if (!value) {
        return '-';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function ProfileAndAccount() {
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const { user, logout } = useAuth();
    const {
        profileData,
        profileLoading,
        profileError,
        deletingAccount,
        changePassword,
        deleteCurrentUser,
    } = useUser();
    const router = useRouter();
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const fullName = useMemo(() => {
        if (!profileData) {
            return '-';
        }

        return [profileData.first_name, profileData.middle_name, profileData.last_name]
            .filter(Boolean)
            .join(' ');
    }, [profileData]);

    const handleChangePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        const message = await changePassword({
            currentPassword: payload.currentPassword,
            newPassword: payload.newPassword,
        });
        Alert.alert('Success', message);
    };

    const handleDeleteAccount = async () => {
        try {
            const successMessage = await deleteCurrentUser();
            await logout();
            setShowDeactivate(false);
            Alert.alert('Success', successMessage);
            router.replace('/login');
        } catch (err) {
            Alert.alert('Delete Failed', (err as Error).message || 'Unable to delete account.');
        }
    };
  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={profile.gradient}>
        <ScrollView>
        <SafeAreaView style={[profile.container, { maxWidth: tokens.containerMaxWidth, alignSelf: 'center', width: '100%', padding: tokens.pagePadding }]}>
            
            <View style={profile.headerContainer}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Feather name="arrow-left" size={24} color="black" />
                </Pressable>
                <View>
                    <Text style={[profile.headerTitle, { fontSize: tokens.title }]}>Profile & Account</Text>
                    <Text style={[profile.subHeader, { fontSize: tokens.subtitle }]}>Manage your personal information {"\n"}and security profile</Text>
                </View>
            </View>

            <View style={profile.accInfoContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5 }}>
                    <Text style={[profile.accInfoTitle, { fontSize: tokens.subtitle }]}>Personal Information</Text>
                    <Pressable
                        onPress={() => {
                            router.push('/editProfile');
                        }}
                        style={({ pressed }) => [
                            profile.editButton,
                            { opacity: pressed ? 0.5 : 1 },
                        ]}
                    >
                        <Ionicons name="pencil-outline" size={16} color="#000000" />
                        <Text style={{ fontSize: tokens.menuText }}>Edit</Text>
                    </Pressable>
                </View>
                <Text style={[profile.accInfoSubTitle, { fontSize: tokens.body }]}>Your personal information and contact information</Text>

                {profileLoading ? (
                    <View style={profile.feedbackRow}>
                        <ActivityIndicator size="small" color="#7C6FDC" />
                        <Text style={[profile.feedbackText, { fontSize: tokens.body }]}>Loading profile...</Text>
                    </View>
                ) : null}

                {profileError ? (
                    <Text style={[profile.errorText, { fontSize: tokens.chipText }]}>{profileError}</Text>
                ) : null}

                {/* This is for the user information */}
                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Username:</Text>
                    <View style={profile.inputContainer}>
                        <Octicons name="person" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.username || user?.username || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>First Name:</Text>
                    <View style={profile.inputContainer}>
                        <Octicons name="person" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.first_name || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Middle Name:</Text>
                    <View style={profile.inputContainer}>
                        <Octicons name="person" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.middle_name || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Last Name:</Text>
                    <View style={profile.inputContainer}>
                        <Octicons name="person" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.last_name || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Full Name:</Text>
                    <View style={profile.inputContainer}>
                        <Octicons name="person" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{fullName}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Email:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="mail-outline" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.email || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Role:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="shield-outline" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{toDisplayRole(profileData?.role || user?.role)}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Phone Number:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="call-outline" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{profileData?.phone_number || '-'}</Text>
                    </View>
                </View>

                <View style={{ paddingBottom: 15 }}>
                    <Text style={[profile.accCredTitle, { fontSize: tokens.subtitle }]}>Account Created:</Text>
                    <View style={profile.inputContainer}>
                        <Ionicons name="shield-outline" size={16} color="#7C6FDC" />
                        <Text style={[profile.accCredInfo, { fontSize: tokens.body }]}>{formatDate(profileData?.created_at)}</Text>
                    </View>
                </View>
            </View>

            {/* Security Section */}
            <View style={profile.accInfoContainer}>
                <Text style={[profile.accInfoTitle, { fontSize: tokens.subtitle }]}>Security</Text>
                <Text style={[profile.accInfoSubTitle, { fontSize: tokens.body }]}>Manage your password and security settings</Text>
                <Pressable style={profile.changePassButton} onPress={() => setShowChangePassword(true)}>
                        <Ionicons name="shield-outline" size={16} color="#111" />
                        <Text style={[profile.editButtonText, { fontSize: tokens.menuText }]}>Change Password</Text>
                </Pressable>
            </View>

            <View style={profile.accInfoContainerDanger}>
                <Text style={[profile.accInfoTitle, { fontSize: tokens.subtitle }]}>Danger Zone</Text>
                <Text style={[profile.accInfoSubTitle, { fontSize: tokens.body }]}>Irreversible account actions</Text>
                <Pressable style={profile.dangerButton} onPress={() => setShowDeactivate(true)}>
                        <AntDesign name="exclamation-circle" size={16} color="white" />
                        <Text style={[profile.dangerButtonText, { fontSize: tokens.menuText }]}>Delete Account</Text>
                </Pressable>
            </View>

            <DeactivateModal
                visible={showDeactivate}
                loading={deletingAccount}
                onConfirm={handleDeleteAccount}
                onCancel={() => {
                    if (!deletingAccount) {
                        setShowDeactivate(false);
                    }
                }}
            />

            <ChangePasswordModal
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                onSubmit={handleChangePassword}
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

    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },

    feedbackText: {
        color: '#4b4b4b',
        fontSize: 14,
    },

    errorText: {
        color: '#b91c1c',
        marginBottom: 12,
        fontSize: 13,
    },

    changePassButton: {
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
        // width: "100%",
        marginBottom: 5,
    },

    editButton: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#bebebe",
        gap: 10,
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        // width: "100%",
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