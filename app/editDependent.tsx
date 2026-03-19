import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import { useDependents } from '../context/DependentContext';

export default function EditDependentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ dependentId?: string | string[] }>();
    const dependentIdParam = Array.isArray(params.dependentId) ? params.dependentId[0] : params.dependentId;

    const { getDependentById, fetchMyDependents, updateDependentProfile } = useDependents();

    const isDatePickerSupported = Platform.OS !== 'web';

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [sex, setSex] = useState('Select Sex');
    const [sexMenuVisible, setSexMenuVisible] = useState(false);

    const [careNotesInput, setCareNotesInput] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const selectedDependent = useMemo(() => {
        if (!dependentIdParam) return undefined;
        return getDependentById(dependentIdParam);
    }, [dependentIdParam, getDependentById]);

    const resolveDependentNumericId = () => {
        const byParam = Number.parseInt(dependentIdParam?.replace('dep-', '') || '', 10);
        if (!Number.isNaN(byParam)) {
            return byParam;
        }

        if (selectedDependent?.dependentId) {
            return selectedDependent.dependentId;
        }

        return null;
    };

    useEffect(() => {
        if (!selectedDependent && dependentIdParam) {
            fetchMyDependents();
        }
    }, [selectedDependent, dependentIdParam]);

    useEffect(() => {
        if (!selectedDependent) {
            return;
        }

        const fallbackNameParts = selectedDependent.name.split(' ').filter(Boolean);

        setFirstName(selectedDependent.firstName || fallbackNameParts[0] || '');
        setMiddleName(selectedDependent.middleName || '');
        setLastName(selectedDependent.lastName || fallbackNameParts.slice(1).join(' ') || '');
        setUsername(selectedDependent.username || '');
        setEmail(selectedDependent.email || '');
        setSex(selectedDependent.sex ? `${selectedDependent.sex.charAt(0).toUpperCase()}${selectedDependent.sex.slice(1)}` : 'Select Sex');
        setCareNotesInput(selectedDependent.careNotes || '');
        setPhoneNumber(selectedDependent.phoneNumber || '');
        setDateInputValue(selectedDependent.birthDate || formatDateYMD(new Date()));

        const match = selectedDependent.birthDate.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (!match) return;

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        const parsedDate = new Date(year, month - 1, day);

        if (!isNaN(parsedDate.getTime())) {
            setBirthDate(parsedDate);
        }
    }, [selectedDependent]);

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

    const handleUpdateDependent = async () => {
        const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
        const isDateValid = /^(\d{4})\/(\d{2})\/(\d{2})$/.test(dateInputValue);
        const numericDependentId = resolveDependentNumericId();

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

        if (!numericDependentId) {
            Alert.alert('Missing Data', 'Unable to resolve dependent ID for update. Please refresh and try again.');
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
            sex: sex.toLowerCase(),
            birthdate: birthdateForApi,
            phone_number: phoneNumber.trim() || undefined,
        };

        try {
            setSubmitting(true);
            await updateDependentProfile(numericDependentId, requestBody);

            Alert.alert('Success', 'Dependent profile updated successfully.');
            router.back();
        } catch (err) {
            Alert.alert('Update Failed', (err as Error).message || 'Unable to update dependent profile.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={['#E3F2FD', '#F3E5F8', '#E8E4F8']} style={styles.gradient}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <SafeAreaView style={styles.container}>
                        {!selectedDependent ? (
                            <View style={styles.dependentInfoContainer}>
                                <Text style={styles.headerTitle}>Dependent not found</Text>
                                <Text style={styles.subHeader}>The selected dependent could not be loaded.</Text>
                                <Pressable
                                    onPress={() => router.back()}
                                    style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.5 : 1, marginTop: 20 }]}
                                >
                                    <Text style={styles.primaryButtonText}>Go Back</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                <View style={styles.headerContainer}>
                                    <Pressable onPress={() => router.back()} hitSlop={12}>
                                        <Feather name="arrow-left" size={24} color="black" />
                                    </Pressable>
                                    <View>
                                        <Text style={styles.headerTitle}>Edit Dependent</Text>
                                        <Text style={styles.subHeader}>Update dependent information</Text>
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
                                            onPress={handleUpdateDependent}
                                            style={({ pressed }) => [
                                                styles.primaryButton,
                                                { opacity: pressed ? 0.5 : 1 },
                                            ]}
                                            disabled={submitting}
                                        >
                                            <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
                                        </Pressable>
                                    </View>

                                </View>
                            </>
                        )}
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
    input: {
        marginTop: 0,
    },
    inputField: {
        backgroundColor: '#ffffff',
        height: 45,
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