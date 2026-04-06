import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChangePasswordModal from '../components/modals/changePasswordModal';
import DeleteDependentModal from '../components/modals/deleteDependent';
import { useDependents } from '../context/DependentContext';
import { getResponsiveTokens } from '../utils/responsive';

const formatDate = (value?: string) => {
    if (!value) {
        return '-';
    }

    const normalized = value.includes('/') ? value.replace(/\//g, '-') : value;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const toDisplaySex = (value?: string) => {
    if (!value) {
        return '-';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function DependentAccountScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const params = useLocalSearchParams<{ dependentId?: string | string[] }>();
    const dependentIdParam = Array.isArray(params.dependentId) ? params.dependentId[0] : params.dependentId;

    const {
        fetchDependentProfileById,
        changeDependentPassword,
        deleteDependentProfile,
    } = useDependents();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteDependent, setShowDeleteDependent] = useState(false);
    const [deletingDependent, setDeletingDependent] = useState(false);
    const [dependentData, setDependentData] = useState<Awaited<ReturnType<typeof fetchDependentProfileById>> | null>(null);
    const [loadingDependentData, setLoadingDependentData] = useState(false);
    const [dependentDataError, setDependentDataError] = useState<string | null>(null);

    const dependentNumericId = useMemo(() => {
        const fromParam = Number.parseInt((dependentIdParam || '').replace('dep-', ''), 10);
        return Number.isNaN(fromParam) ? null : fromParam;
    }, [dependentIdParam]);

    useEffect(() => {
        if (!dependentNumericId) {
            setDependentData(null);
            setDependentDataError('Invalid dependent ID.');
            return;
        }

        let isMounted = true;

        const loadDependent = async () => {
            try {
                setLoadingDependentData(true);
                setDependentDataError(null);
                const data = await fetchDependentProfileById(dependentNumericId);

                if (!isMounted) {
                    return;
                }

                setDependentData(data);
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setDependentData(null);
                setDependentDataError((err as Error).message || 'Unable to fetch dependent profile.');
            } finally {
                if (isMounted) {
                    setLoadingDependentData(false);
                }
            }
        };

        loadDependent();

        return () => {
            isMounted = false;
        };
    }, [dependentNumericId, fetchDependentProfileById]);

    const handleChangePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        const numericId = dependentNumericId;

        if (!numericId) {
            throw new Error('Unable to resolve dependent ID for password change.');
        }

        const message = await changeDependentPassword(numericId, {
            old_password: payload.currentPassword,
            new_password: payload.newPassword,
        });

        Alert.alert('Success', message);
    };

    const handleDeleteDependent = async () => {
        if (!dependentNumericId) {
            Alert.alert('Delete Failed', 'Unable to resolve dependent ID for deletion.');
            return;
        }

        try {
            setDeletingDependent(true);
            const message = await deleteDependentProfile(dependentNumericId);
            setShowDeleteDependent(false);
            Alert.alert('Success', message || 'Dependent profile deleted successfully.');
            router.replace('/dependentProfile');
        } catch (err) {
            Alert.alert('Delete Failed', (err as Error).message || 'Unable to delete dependent profile.');
        } finally {
            setDeletingDependent(false);
        }
    };

    const fullName = useMemo(() => {
        if (!dependentData) {
            return '-';
        }

        return [dependentData.firstName, dependentData.middleName, dependentData.lastName]
            .filter(Boolean)
            .join(' ') || dependentData.name || '-';
    }, [dependentData]);

    return (
        <LinearGradient colors={['#E3F2FD', '#F3E5F8', '#E8E4F8']} style={styles.gradient}>
            <ScrollView>
                <SafeAreaView style={[styles.container, { maxWidth: tokens.containerMaxWidth, alignSelf: 'center', width: '100%', padding: tokens.pagePadding }] }>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => router.back()} hitSlop={12}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <View>
                            <Text style={[styles.headerTitle, { fontSize: tokens.title }]}>Dependent Profile</Text>
                            <Text style={[styles.subHeader, { fontSize: tokens.subtitle }]}>Manage dependent information and security</Text>
                        </View>
                    </View>

                    <View style={styles.accInfoContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
                            <Text style={[styles.accInfoTitle, { fontSize: tokens.subtitle }]}>Dependent Information</Text>
                            <Pressable
                                onPress={() => {
                                    if (!dependentIdParam) {
                                        return;
                                    }

                                    router.push({
                                        pathname: '/editDependent',
                                        params: { dependentId: dependentIdParam },
                                    });
                                }}
                                style={({ pressed }) => [
                                    styles.editButton,
                                    { opacity: pressed ? 0.5 : 1 },
                                ]}
                            >
                                <Ionicons name="pencil-outline" size={16} color="#000000" />
                                <Text style={{ fontSize: tokens.menuText }}>Edit</Text>
                            </Pressable>
                        </View>

                        <Text style={[styles.accInfoSubTitle, { fontSize: tokens.body }]}>Dependent profile details and contact information</Text>

                        {loadingDependentData && !dependentData ? (
                            <View style={styles.feedbackRow}>
                                <ActivityIndicator size="small" color="#7C6FDC" />
                                <Text style={[styles.feedbackText, { fontSize: tokens.body }]}>Loading dependent...</Text>
                            </View>
                        ) : null}

                        {dependentDataError ? <Text style={[styles.errorText, { fontSize: tokens.chipText }]}>{dependentDataError}</Text> : null}

                        {!loadingDependentData && !dependentData ? (
                            <Text style={[styles.errorText, { fontSize: tokens.chipText }]}>Dependent not found.</Text>
                        ) : null}

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Username:</Text>
                            <View style={styles.inputContainer}>
                                <Octicons name="person" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.username || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>First Name:</Text>
                            <View style={styles.inputContainer}>
                                <Octicons name="person" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.firstName || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Last Name:</Text>
                            <View style={styles.inputContainer}>
                                <Octicons name="person" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.lastName || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Full Name:</Text>
                            <View style={styles.inputContainer}>
                                <Octicons name="person" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{fullName}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Email:</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.email || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Sex:</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-circle-outline" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{toDisplaySex(dependentData?.sex)}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Phone Number:</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.phoneNumber || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Birth Date:</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar-outline" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{formatDate(dependentData?.birthDate)}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.accCredTitle, { fontSize: tokens.subtitle }]}>Care Notes:</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="document-text-outline" size={16} color="#7C6FDC" />
                                <Text style={[styles.accCredInfo, { fontSize: tokens.body }]}>{dependentData?.careNotes || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.accInfoContainer}>
                        <Text style={[styles.accInfoTitle, { fontSize: tokens.subtitle }]}>Security</Text>
                        <Text style={[styles.accInfoSubTitle, { fontSize: tokens.body }]}>Manage dependent account password</Text>
                        <Pressable style={styles.changePassButton} onPress={() => setShowChangePassword(true)}>
                            <Ionicons name="shield-outline" size={16} color="#111" />
                            <Text style={[styles.editButtonText, { fontSize: tokens.menuText }]}>Change Password</Text>
                        </Pressable>
                    </View>

                    <View style={styles.accInfoContainerDanger}>
                        <Text style={[styles.accInfoTitle, { fontSize: tokens.subtitle }]}>Danger Zone</Text>
                        <Text style={[styles.accInfoSubTitle, { fontSize: tokens.body }]}>Irreversible account actions</Text>
                        <Pressable style={styles.dangerButton} onPress={() => setShowDeleteDependent(true)}>
                            <AntDesign name="exclamation-circle" size={16} color="white" />
                            <Text style={[styles.dangerButtonText, { fontSize: tokens.menuText }]}>Delete Dependent</Text>
                        </Pressable>
                    </View>

                    <ChangePasswordModal
                        visible={showChangePassword}
                        onClose={() => setShowChangePassword(false)}
                        onSubmit={handleChangePassword}
                    />

                    <DeleteDependentModal
                        visible={showDeleteDependent}
                        dependentName={fullName !== '-' ? fullName : dependentData?.name}
                        loading={deletingDependent}
                        onConfirm={handleDeleteDependent}
                        onCancel={() => {
                            if (!deletingDependent) {
                                setShowDeleteDependent(false);
                            }
                        }}
                    />
                </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
    },
    headerContainer: {
        paddingTop: 0,
        padding: 15,
        paddingBottom: 0,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    accInfoContainer: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
    },
    accInfoContainerDanger: {
        marginTop: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ff4d4d',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
    },
    accInfoTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 5,
        marginBottom: 4,
    },
    accInfoSubTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    fieldGroup: {
        paddingBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    accCredTitle: {
        fontSize: 16,
        color: 'black',
        fontWeight: '500',
        paddingBottom: 5,
    },
    accCredInfo: {
        fontSize: 15,
        color: '#333',
        paddingHorizontal: 8,
        fontWeight: '400',
        flex: 1,
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
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#bebebe',
        gap: 10,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    editButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#bebebe',
        gap: 10,
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    editButtonText: {
        color: '#000000',
        fontWeight: '500',
        fontSize: 15,
    },
    dangerButton: {
        backgroundColor: '#ff4d4d',
        gap: 10,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 5,
    },
    dangerButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 15,
    },
});
