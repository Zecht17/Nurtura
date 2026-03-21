import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import { useDependents } from '../context/DependentContext';

export default function AddDependentScreen() {
    const router = useRouter();
    const { createDependentProfile } = useDependents();

    const isDatePickerSupported = Platform.OS !== 'web';

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const role: 'dependent' = 'dependent';
    const [sex, setSex] = useState('Select Sex');
    const [sexMenuVisible, setSexMenuVisible] = useState(false);

    const [careNotesInput, setCareNotesInput] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const [nameError, setNameError] = useState('');
    const [dateError, setDateError] = useState('');

    const formatDateYMD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateInputValue, setDateInputValue] = useState(formatDateYMD(new Date()));

    const handleDateChange = (date: Date) => {
        setBirthDate(date);
        setDateInputValue(formatDateYMD(date));
    };

    const handleCloseDatePicker = () => {
        setShowDatePicker(false);
    };

    const handleManualDateInput = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;

        if (digits.length > 4) {
            formatted = `${digits.slice(0, 4)}/${digits.slice(4)}`;
        }
        if (digits.length > 6) {
            formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
        }

        setDateInputValue(formatted);

        const match = formatted.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (!match) {
            return;
        }

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        const parsedDate = new Date(year, month - 1, day);

        if (
            !isNaN(parsedDate.getTime()) &&
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
        ) {
            setBirthDate(parsedDate);
        }
    };

    const handleAddDependent = async () => {
        const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
        const isDateValid = /^(\d{4})\/(\d{2})\/(\d{2})$/.test(dateInputValue);

        setNameError(fullName ? '' : 'First name and last name are required.');
        setDateError(isDateValid ? '' : 'Please enter a valid date in YYYY/MM/DD format.');

        if (!fullName || !isDateValid) {
            return;
        }

        if (!username.trim() || !email.trim()) {
            Alert.alert('Missing Fields', 'Username and email are required.');
            return;
        }

        if (sex === 'Select Sex') {
            Alert.alert('Missing Field', 'Please select sex.');
            return;
        }

        if (!password.trim() || !confirmPassword.trim()) {
            Alert.alert('Missing Fields', 'Password and confirm password are required.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Error', 'Password and confirm password do not match.');
            return;
        }

        const birthdateForApi = dateInputValue.replace(/\//g, '-');

        const requestBody = {
            care_notes: careNotesInput.trim(),
            first_name: firstName.trim(),
            middle_name: middleName.trim() || undefined,
            last_name: lastName.trim(),
            username: username.trim(),
            email: email.trim(),
            role,
            sex: sex.toLowerCase(),
            birthdate: birthdateForApi,
            phone_number: phoneNumber.trim() || undefined,
            password,
        };

        try {
            setSubmitting(true);
            await createDependentProfile(requestBody);

            Alert.alert('Success', 'Dependent account registered successfully.');
            router.back();
        } catch (err) {
            Alert.alert('Registration Failed', (err as Error).message || 'Unable to register dependent.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={['#E3F2FD', '#F3E5F8', '#E8E4F8']} style={styles.gradient}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <SafeAreaView style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Pressable onPress={() => router.back()} hitSlop={12}>
                                <Feather name="arrow-left" size={24} color="black" />
                            </Pressable>
                            <View>
                                <Text style={styles.headerTitle}>Add Dependent</Text>
                                <Text style={styles.subHeader}>Create a new dependent profile</Text>
                            </View>
                        </View>

                        <View style={styles.dependentInfoContainer}>
                            <Text style={styles.containerTitle}>Personal Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>First Name *</Text>
                                <TextInput
                                    placeholder="First Name"
                                    placeholderTextColor="#9CA3AF"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Middle Name (Optional)</Text>
                                <TextInput
                                    placeholder="Middle Name"
                                    placeholderTextColor="#9CA3AF"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={middleName}
                                    onChangeText={setMiddleName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Last Name *</Text>
                                <TextInput
                                    placeholder="Last Name"
                                    placeholderTextColor="#9CA3AF"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Username *</Text>
                                <TextInput
                                    placeholder="Username"
                                    placeholderTextColor="#9CA3AF"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Email *</Text>
                                <TextInput
                                    placeholder="example@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Date of Birth *</Text>
                            <View style={styles.datePickerContainer}>
                                <TextInput
                                    value={dateInputValue}
                                    onChangeText={(text) => {
                                        handleManualDateInput(text);
                                        if (dateError) setDateError('');
                                    }}
                                    mode="outlined"
                                    editable={true}
                                    keyboardType="number-pad"
                                    placeholder="YYYY/MM/DD"
                                    placeholderTextColor="#9CA3AF"
                                    right={<TextInput.Icon icon="calendar" onPress={() => {
                                        if (isDatePickerSupported) {
                                            setShowDatePicker(true);
                                        }
                                    }} />}
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                />
                            </View>
                            {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputTitle}>Sex *</Text>
                                    <Menu
                                        visible={sexMenuVisible}
                                        onDismiss={() => setSexMenuVisible(false)}
                                        anchor={
                                            <Pressable onPress={() => setSexMenuVisible(true)}>
                                                <TextInput
                                                    value={sex}
                                                    editable={false}
                                                    mode="outlined"
                                                    pointerEvents="none"
                                                    right={<TextInput.Icon icon="menu-down" />}
                                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                    style={styles.inputField}
                                                />
                                            </Pressable>
                                        }
                                        contentStyle={styles.dropdownContent}
                                        style={styles.dropdownSmall}
                                    >
                                        <Menu.Item onPress={() => { setSex('Female'); setSexMenuVisible(false); }} title="Female" />
                                        <Menu.Item onPress={() => { setSex('Male'); setSexMenuVisible(false); }} title="Male" />
                                        <Menu.Item onPress={() => { setSex('Other'); setSexMenuVisible(false); }} title="Other" />
                                    </Menu>
                                </View>

                            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                            <TextInput
                                placeholder="09123456789"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                mode="outlined"
                                activeOutlineColor="#6d28d9"
                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                style={[styles.input, styles.inputField]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Password *</Text>
                                <TextInput
                                    secureTextEntry={!passwordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                    mode="outlined"
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    right={<TextInput.Icon icon={passwordVisible ? 'eye-off' : 'eye'} onPress={() => setPasswordVisible((prev) => !prev)} forceTextInputFocus={false} />}
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputTitle}>Confirm Password *</Text>
                                <TextInput
                                    secureTextEntry={!confirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    mode="outlined"
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9CA3AF"
                                    right={<TextInput.Icon icon={confirmPasswordVisible ? 'eye-off' : 'eye'} onPress={() => setConfirmPasswordVisible((prev) => !prev)} forceTextInputFocus={false} />}
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Care Notes</Text>
                            <TextInput
                                autoCapitalize="none"
                                keyboardType="default"
                                placeholder="Allergies, medications, conditions, etc."
                                placeholderTextColor="#9CA3AF"
                                value={careNotesInput}
                                onChangeText={setCareNotesInput}
                                mode="outlined"
                                activeOutlineColor="#6d28d9"
                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                multiline={true}
                                numberOfLines={4}
                                style={[styles.inputFieldLarge]}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 }}>
                                <Pressable
                                    onPress={() => router.back()}
                                    style={({ pressed }) => [
                                        styles.secondaryButton,
                                        { opacity: pressed ? 0.5 : 1 },
                                    ]}
                                    disabled={submitting}
                                >
                                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleAddDependent}
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        { opacity: pressed ? 0.5 : 1 },
                                    ]}
                                    disabled={submitting}
                                >
                                    <Text style={styles.primaryButtonText}>{submitting ? 'Creating...' : 'Add Dependent'}</Text>
                                </Pressable>
                            </View>

                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomDatePickerModal
                visible={isDatePickerSupported && showDatePicker}
                date={birthDate}
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
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
    },
    headerContainer: {
        padding: 15,
        paddingTop: 0,
        paddingBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    dependentInfoContainer: {
        marginTop: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    containerTitle: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '500',
        marginBottom: 6,
    },
    inputLabel: {
        paddingTop: 10,
        paddingBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#707070',
    },
    inputTitle: {
        paddingBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#707070',
    },
    inputGroup: {
        paddingTop: 8,
    },
    inputRow: {
        flexDirection: 'row',
        columnGap: 12,
    },
    input: {
        marginTop: 0,
    },
    inputField: {
        backgroundColor: '#ffffff',
        height: 45,
    },
    dropdown: {
        borderRadius: 16,
        width: '85%',
        // marginLeft: -10,
        marginTop: 50,
        marginVertical: 5,
    },
    dropdownSmall: {
        borderRadius: 16,
        marginTop: 40,
        marginVertical: 5,
    },
    dropdownContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    dropdownItemText: {
        color: '#000000',
    },
    datePickerContainer: {
        width: '100%',
    },
    inputFieldLarge: {
        backgroundColor: '#ffffff',
        height: 120,
        textAlignVertical: 'top',
        marginTop: 4,
    },
    primaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#7C6FDC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#7C6FDC',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    secondaryButtonText: {
        color: '#3f2f8f',
        fontSize: 15,
        fontWeight: '500',
    },
    errorText: {
        color: '#D14343',
        fontSize: 12,
        marginTop: 6,
    },
});
