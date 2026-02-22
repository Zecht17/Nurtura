import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomTimePickerModalProps {
    visible: boolean;
    time: Date;
    onTimeChange: (time: Date) => void;
    onClose: () => void;
}

export default function CustomTimePickerModal({
    visible,
    time,
    onTimeChange,
    onClose,
}: CustomTimePickerModalProps) {
    const [tempTime, setTempTime] = React.useState(time);

    React.useEffect(() => {
        setTempTime(time);
    }, [time, visible]);

    const handleTimeChange = (event: any, selectedTime: any) => {
        if (selectedTime) {
            setTempTime(selectedTime);
        }
    };

    const handleConfirm = () => {
        onTimeChange(tempTime);
        onClose();
    };

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

                    {/* Time Picker */}
                    <View style={styles.pickerContainer}>
                        <DateTimePicker
                            value={tempTime}
                            mode="time"
                            display="spinner"
                            onChange={handleTimeChange}
                            textColor="#000000"
                        />
                    </View>

                    {/* Selected time display */}
                    <View style={styles.selectedTimeContainer}>
                        <Text style={styles.selectedTimeText}>
                            {tempTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
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
    selectedTimeContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F3E5F8',
        marginHorizontal: 20,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    selectedTimeText: {
        fontSize: 14,
        color: '#7C6FDC',
        fontWeight: '600',
    },
});
