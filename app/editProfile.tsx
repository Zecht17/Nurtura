import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import { useUser } from '../context/UserContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const {
        profileData,
        profileLoading,
        profileError,
        updatingProfile,
        updateCurrentUser,
        clearProfileError,
    } = useUser();

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [sex, setSex] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [birthDateValue, setBirthDateValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sexMenuVisible, setSexMenuVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    type FieldErrors = {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        username?: string;
        email?: string;
        sex?: string;
        birthdate?: string;
        phoneNumber?: string;
        general?: string;
    };

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const isDatePickerSupported = Platform.OS !== 'web';

    useEffect(() => {
        if (!profileData) {
            return;
        }

        setFirstName(profileData.first_name || '');
        setMiddleName(profileData.middle_name || '');
        setLastName(profileData.last_name || '');
        setUsername(profileData.username || '');
        setEmail(profileData.email || '');
        setSex(profileData.sex || '');
        setBirthdate(profileData.birthdate || '');
        setPhoneNumber(profileData.phone_number || '');

        const parsedBirthdate = new Date(profileData.birthdate || '');
        if (!Number.isNaN(parsedBirthdate.getTime())) {
            setBirthDateValue(parsedBirthdate);
        }
    }, [profileData]);

    const handleBirthdateChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;

        if (digits.length > 4) {
            formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
        }

        if (digits.length > 6) {
            formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
        }

        setBirthdate(formatted);

        const match = formatted.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return;
        }

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        const parsedDate = new Date(year, month - 1, day);

        if (
            !Number.isNaN(parsedDate.getTime()) &&
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
        ) {
            setBirthDateValue(parsedDate);
        }
    };

    const handleDateChange = (date: Date) => {
        setBirthDateValue(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setBirthdate(`${year}-${month}-${day}`);
    };

    const handleCloseDatePicker = () => {
        setShowDatePicker(false);
    };

    const validateForm = (): FieldErrors => {
        const errors: FieldErrors = {};

        const nameRegex = /^[A-Za-z\s'-]+$/;

        if (!firstName.trim()) {
            errors.firstName = 'First name is required.';
        } else if (!nameRegex.test(firstName.trim())) {
            errors.firstName = 'First name can only contain letters, spaces, apostrophes, and hyphens.';
        }

        if (middleName.trim() && !nameRegex.test(middleName.trim())) {
            errors.middleName = 'Middle name can only contain letters, spaces, apostrophes, and hyphens.';
        }

        if (!lastName.trim()) {
            errors.lastName = 'Last name is required.';
        } else if (!nameRegex.test(lastName.trim())) {
            errors.lastName = 'Last name can only contain letters, spaces, apostrophes, and hyphens.';
        }

        if (!username.trim()) {
            errors.username = 'Username is required.';
        }

        if (!email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Enter a valid email address (example: name@email.com).';
        }

        if (!sex.trim()) {
            errors.sex = 'Please select a sex.';
        }

        if (!birthdate.trim()) {
            errors.birthdate = 'Birthdate is required.';
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate.trim())) {
            errors.birthdate = 'Birthdate must be in YYYY-MM-DD format.';
        }

        return errors;
    };

    const mapServerErrorToFieldErrors = (message: string): FieldErrors => {
        const normalized = message.toLowerCase();

        if (normalized.includes('first_name') || normalized.includes('first name') || normalized.includes('pattern')) {
            return {
                firstName: 'First name can only contain letters, spaces, apostrophes, and hyphens.',
            };
        }

        if (normalized.includes('last_name') || normalized.includes('last name')) {
            return {
                lastName: 'Last name can only contain letters, spaces, apostrophes, and hyphens.',
            };
        }

        if (normalized.includes('middle_name') || normalized.includes('middle name')) {
            return {
                middleName: 'Middle name can only contain letters, spaces, apostrophes, and hyphens.',
            };
        }

        if (normalized.includes('email')) {
            return {
                email: 'Please enter a valid email address.',
            };
        }

        if (normalized.includes('username')) {
            return {
                username: 'Please enter a valid username.',
            };
        }

        if (normalized.includes('birthdate') || normalized.includes('date')) {
            return {
                birthdate: 'Please enter a valid birthdate in YYYY-MM-DD format.',
            };
        }

        return {
            general: 'We could not update your profile. Please review your inputs and try again.',
        };
    };

    const handleSave = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        clearProfileError();

        try {
            const payload: {
                first_name: string;
                middle_name?: string;
                last_name: string;
                username: string;
                email: string;
                sex: string;
                birthdate: string;
                phone_number?: string;
            } = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                username: username.trim(),
                email: email.trim(),
                sex: sex.trim().toLowerCase(),
                birthdate: birthdate.trim(),
            };

            if (middleName.trim()) {
                payload.middle_name = middleName.trim();
            }

            if (phoneNumber.trim()) {
                payload.phone_number = phoneNumber.trim();
            }

            await updateCurrentUser(payload);

            Alert.alert('Success', 'Your profile was updated.');
            router.replace('/profileAndAccount');
        } catch (err) {
            const message = (err as Error).message || 'Unable to update profile';
            setFieldErrors(mapServerErrorToFieldErrors(message));
        }
    };

    return (
        <LinearGradient colors={['#E3F2FD', '#F3E5F8', '#E8E4F8']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.headerContainer}>
                            <Pressable onPress={() => router.back()} hitSlop={12}>
                                <Feather name="arrow-left" size={24} color="black" />
                            </Pressable>
                            <View>
                                <Text style={styles.headerTitle}>Edit Profile</Text>
                                <Text style={styles.subHeader}>Update your personal information</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            {profileLoading ? (
                                <View style={styles.feedbackRow}>
                                    <ActivityIndicator size="small" color="#7C6FDC" />
                                    <Text style={styles.feedbackText}>Loading profile...</Text>
                                </View>
                            ) : null}

                            {fieldErrors.general ? <Text style={styles.errorText}>{fieldErrors.general}</Text> : null}
                            {!fieldErrors.general && profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

                            <Text style={styles.inputTitle}>First Name</Text>
                            <TextInput
                                mode="outlined"
                                value={firstName}
                                onChangeText={(value) => {
                                    setFirstName(value);
                                    if (fieldErrors.firstName) {
                                        setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                                    }
                                }}
                                placeholder="First Name"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.firstName ? <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text> : null}

                            <Text style={styles.inputTitle}>Middle Name (Optional)</Text>
                            <TextInput
                                mode="outlined"
                                value={middleName}
                                onChangeText={(value) => {
                                    setMiddleName(value);
                                    if (fieldErrors.middleName) {
                                        setFieldErrors((prev) => ({ ...prev, middleName: undefined }));
                                    }
                                }}
                                placeholder="Middle Name"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.middleName ? <Text style={styles.fieldErrorText}>{fieldErrors.middleName}</Text> : null}

                            <Text style={styles.inputTitle}>Last Name</Text>
                            <TextInput
                                mode="outlined"
                                value={lastName}
                                onChangeText={(value) => {
                                    setLastName(value);
                                    if (fieldErrors.lastName) {
                                        setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                                    }
                                }}
                                placeholder="Last Name"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.lastName ? <Text style={styles.fieldErrorText}>{fieldErrors.lastName}</Text> : null}

                            <Text style={styles.inputTitle}>Username</Text>
                            <TextInput
                                mode="outlined"
                                value={username}
                                onChangeText={(value) => {
                                    setUsername(value);
                                    if (fieldErrors.username) {
                                        setFieldErrors((prev) => ({ ...prev, username: undefined }));
                                    }
                                }}
                                placeholder="Username"
                                autoCapitalize="none"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.username ? <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text> : null}

                            <Text style={styles.inputTitle}>Email</Text>
                            <TextInput
                                mode="outlined"
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    if (fieldErrors.email) {
                                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                                    }
                                }}
                                placeholder="example@email.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}

                            <Text style={styles.inputTitle}>Sex</Text>
                            <Menu
                                visible={sexMenuVisible}
                                onDismiss={() => setSexMenuVisible(false)}
                                anchor={
                                    <Pressable onPress={() => setSexMenuVisible(true)}>
                                        <TextInput
                                            mode="outlined"
                                            value={sex ? `${sex.charAt(0).toUpperCase()}${sex.slice(1)}` : 'Select Sex'}
                                            editable={false}
                                            pointerEvents="none"
                                            right={<TextInput.Icon icon="menu-down" />}
                                            style={styles.inputField}
                                            outlineStyle={styles.outline}
                                            disabled={profileLoading || updatingProfile}
                                        />
                                    </Pressable>
                                }
                                contentStyle={styles.dropdownContent}
                                style={styles.dropdownSmall}
                            >
                                <Menu.Item onPress={() => { setSex('female'); setSexMenuVisible(false); }} title="Female" />
                                <Menu.Item onPress={() => { setSex('male'); setSexMenuVisible(false); }} title="Male" />
                                <Menu.Item onPress={() => { setSex('other'); setSexMenuVisible(false); }} title="Other" />
                            </Menu>
                            {fieldErrors.sex ? <Text style={styles.fieldErrorText}>{fieldErrors.sex}</Text> : null}

                            <Text style={styles.inputTitle}>Birthdate</Text>
                            <TextInput
                                mode="outlined"
                                value={birthdate}
                                onChangeText={(value) => {
                                    handleBirthdateChange(value);
                                    if (fieldErrors.birthdate) {
                                        setFieldErrors((prev) => ({ ...prev, birthdate: undefined }));
                                    }
                                }}
                                placeholder="YYYY-MM-DD"
                                keyboardType="phone-pad"
                                right={<TextInput.Icon icon="calendar" onPress={() => {
                                    if (isDatePickerSupported) {
                                        setShowDatePicker(true);
                                    }
                                }} />}
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />
                            {fieldErrors.birthdate ? <Text style={styles.fieldErrorText}>{fieldErrors.birthdate}</Text> : null}

                            <Text style={styles.inputTitle}>Phone Number (Optional)</Text>
                            <TextInput
                                mode="outlined"
                                value={phoneNumber}
                                onChangeText={(value) => {
                                    setPhoneNumber(value);
                                    if (fieldErrors.phoneNumber) {
                                        setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                                    }
                                }}
                                placeholder="09123456789"
                                keyboardType="phone-pad"
                                style={styles.inputField}
                                outlineStyle={styles.outline}
                                disabled={profileLoading || updatingProfile}
                            />

                            <View style={styles.buttonRow}>
                                <Button
                                    mode="outlined"
                                    onPress={() => router.back()}
                                    disabled={updatingProfile}
                                    style={styles.button}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    loading={updatingProfile}
                                    disabled={profileLoading || updatingProfile}
                                    style={styles.button}
                                >
                                    Save
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <CustomDatePickerModal
                visible={isDatePickerSupported && showDatePicker}
                date={birthDateValue}
                onDateChange={handleDateChange}
                onClose={handleCloseDatePicker}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
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
    scrollContent: {
        paddingBottom: 24,
    },
    card: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 16,
        borderRadius: 12,
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
    fieldErrorText: {
        color: '#b91c1c',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 10,
    },
    inputTitle: {
        fontSize: 13,
        color: '#2b2b2b',
        marginBottom: 6,
        marginTop: 4,
    },
    inputField: {
        backgroundColor: '#ffffff',
        marginBottom: 12,
        height: 45,
    },
    outline: {
        borderRadius: 12,
        borderWidth: 1.5,
    },
    dropdownSmall: {
        width: "85%",
        borderRadius: 16,
        marginTop: 50,
        marginVertical: 5,
    },
    dropdownContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    button: {
        flex: 1,
    },
});
