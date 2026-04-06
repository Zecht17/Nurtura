import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface CustomDatePickerModalProps {
    visible: boolean;
    date: Date;
    onDateChange: (date: Date) => void;
    onClose: () => void;
}

export default function CustomDatePickerModal({
    visible,
    date,
    onDateChange,
    onClose,
}: CustomDatePickerModalProps) {
    const [tempDate, setTempDate] = React.useState(date);

    React.useEffect(() => {
        setTempDate(date);
    }, [date, visible]);

    const handleDateChange = (event: any, selectedDate: any) => {
        if (Platform.OS === 'android') {
            if (event?.type === 'set' && selectedDate) {
                onDateChange(selectedDate);
            }
            onClose();
            return;
        }

        if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleConfirm = () => {
        onDateChange(tempDate);
        onClose();
    };

    if (!visible) return null;

    if (Platform.OS === 'android') {
        return (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
            />
        );
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header with Cancel and Confirm */}
                    <View style={styles.modalHeader}>
                        <Pressable onPress={onClose}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleConfirm}>
                            <Text style={styles.confirmButton}>Confirm</Text>
                        </Pressable>
                    </View>

                    {/* Date Picker */}
                    <View style={styles.pickerContainer}>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            textColor="#000000"
                        />
                    </View>

                    {/* Selected date display */}
                    <View style={styles.selectedDateContainer}>
                        <Text style={styles.selectedDateText}>
                            {tempDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cancelButton: {
        fontSize: 16,
        color: '#999999',
        fontWeight: '600',
    },
    confirmButton: {
        fontSize: 16,
        color: '#7C6FDC',
        fontWeight: '700',
    },
    pickerContainer: {
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: 280,
        backgroundColor: '#ffffff',
    },
    selectedDateContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F3E5F8',
        marginHorizontal: 20,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    selectedDateText: {
        fontSize: 14,
        color: '#7C6FDC',
        fontWeight: '600',
    },
});
