import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import { DependentType, useDependents } from '../context/DependentContext';

export default function EditDependentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ dependentId?: string | string[] }>();
    const dependentId = Array.isArray(params.dependentId) ? params.dependentId[0] : params.dependentId;
    const { getDependentById, updateDependent } = useDependents();
    const isDatePickerSupported = Platform.OS !== 'web';
    const [fullName, setFullName] = useState('');
    const [dependentType, setDependentType] = React.useState<DependentType | ''>('');
    const [careNotesInput, setCareNotesInput] = useState('');
    const [additionalNotesInput, setAdditionalNotesInput] = useState('');
    const [nameError, setNameError] = useState('');
    const [typeError, setTypeError] = useState('');
    const [dateError, setDateError] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
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
        if (!dependentId) return undefined;
        return getDependentById(dependentId);
    }, [dependentId, getDependentById]);

    useEffect(() => {
        if (!selectedDependent) {
            return;
        }

        setFullName(selectedDependent.name);
        setDependentType(selectedDependent.type);
        setCareNotesInput(selectedDependent.careNotes);
        setAdditionalNotesInput(selectedDependent.notes);
        setDateInputValue(selectedDependent.birthDate);

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

    const handleUpdateDependent = () => {
        const trimmedName = fullName.trim();
        const isDateValid = /^(\d{4})\/(\d{2})\/(\d{2})$/.test(dateInputValue);

        setNameError(trimmedName ? '' : 'Full name is required.');
        setTypeError(dependentType ? '' : 'Dependent type is required.');
        setDateError(isDateValid ? '' : 'Please enter a valid date in YYYY/MM/DD format.');

        if (!trimmedName || !dependentType || !isDateValid || !dependentId) {
            return;
        }

        updateDependent(dependentId, {
            name: trimmedName,
            type: dependentType,
            birthDate: dateInputValue,
            careNotes: careNotesInput.trim(),
            notes: additionalNotesInput.trim(),
        });

        router.back();
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
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                autoCapitalize="none"
                                keyboardType="default"
                                placeholder="Enter Full Name"
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    if (nameError) setNameError('');
                                }}
                                mode="outlined"
                                activeOutlineColor="#6d28d9"
                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                style={[styles.input, styles.inputField]}
                            />
                            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

                            {/* This is for the drop down */}
                            <Text style={styles.inputLabel}>Type *</Text>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <Pressable onPress={() => setMenuVisible(true)}>
                                        <TextInput
                                            // label="Dependent"
                                            value={dependentType || 'Select Dependent Type'}
                                            mode="outlined"
                                            editable={false}
                                            pointerEvents="none"
                                            textColor={dependentType ? '#000000' : '#7a7979'}
                                            right={<TextInput.Icon icon="menu-down" />}
                                            outlineStyle={{ borderRadius: 16, borderWidth: 1.5 }}
                                            style={styles.inputField}
                                        />
                                    </Pressable>
                                }
                                contentStyle={styles.dropdownContent}
                                style={styles.dropdown}
                            >
                                <Menu.Item onPress={() => { setDependentType('General'); setTypeError(''); setMenuVisible(false); }} title="General" titleStyle={styles.dropdownItemText} />
                                <Menu.Item onPress={() => { setDependentType('Child'); setTypeError(''); setMenuVisible(false); }} title="Child" titleStyle={styles.dropdownItemText} />
                                <Menu.Item onPress={() => { setDependentType('Elderly'); setTypeError(''); setMenuVisible(false); }} title="Elderly" titleStyle={styles.dropdownItemText} />
                                <Menu.Item onPress={() => { setDependentType('Special Needs'); setTypeError(''); setMenuVisible(false); }} title="Special Needs" titleStyle={styles.dropdownItemText} />
                            </Menu>
                            {!!typeError && <Text style={styles.errorText}>{typeError}</Text>}

                            {/* Birthday */}
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
                                    right={<TextInput.Icon icon="calendar" onPress={() => {
                                        if (isDatePickerSupported) {
                                            setShowDatePicker(true);
                                        }
                                    }} />}
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={styles.inputField}
                                />
                            </View>
                            {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}

                            {/* care notes */}
                            <Text style={styles.inputLabel}>Care Notes</Text>
                            <TextInput
                                // label="Task Description" 
                                autoCapitalize="none"
                                keyboardType="default"
                                placeholder="Allergies, medications, conditions, etc."
                                value={careNotesInput}
                                onChangeText={setCareNotesInput}
                                mode="outlined"
                                activeOutlineColor="#6d28d9"
                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                multiline={true}
                                numberOfLines={4}
                                style={[styles.inputFieldLarge]}
                            />

                            {/* additional info */}
                            <Text style={styles.inputLabel}>Additional Notes</Text>
                            <TextInput
                                // label="Task Description" 
                                autoCapitalize="none"
                                keyboardType="default"
                                placeholder="Preferences, routines, special needs, etc."
                                value={additionalNotesInput}
                                onChangeText={setAdditionalNotesInput}
                                mode="outlined"
                                activeOutlineColor="#6d28d9"
                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                multiline={true}
                                numberOfLines={4}
                                style={[styles.inputFieldLarge]}
                            />
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                <Pressable
                                    onPress={handleUpdateDependent}
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        { opacity: pressed ? 0.5 : 1 },
                                    ]}
                                >
                                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.back()}
                                    style={({ pressed }) => [
                                        styles.secondaryButton,
                                        { opacity: pressed ? 0.5 : 1 },
                                    ]}
                                >
                                    <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    },
    inputLabel: {
        padding: 10,
        paddingLeft: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#707070",
    },

    input: {
        marginTop: 0,
    },

    inputField: {
        backgroundColor: "#ffffff",
        height: 45,  // to adjust the input smaller or bigger
    },

    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "89%",
        marginLeft: -10,
        marginTop: 40,
        marginVertical: 5,
    },

    dropdownContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
    },

    dropdownItemText: {
        color: "#000000",
    },

    datePickerContainer: {
        width: '100%',
    },

    inputFieldLarge: {
        backgroundColor: "#ffffff",
        height: 120,  // Larger height for descriptions
        textAlignVertical: "top",
    },

    primaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        backgroundColor: "#7C6FDC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },

    primaryButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },

    secondaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#7C6FDC",
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },

    secondaryButtonText: {
        color: "#3f2f8f",
        fontSize: 15,
        fontWeight: "500",
    },

    errorText: {
        color: '#D14343',
        fontSize: 12,
        marginTop: 6,
    },
});