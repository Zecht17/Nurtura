import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type DeleteDependentModalProps = {
    visible: boolean;
    dependentName?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function DeleteDependentModal({
    visible,
    dependentName,
    loading = false,
    onConfirm,
    onCancel,
}: DeleteDependentModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Delete Dependent?</Text>
                    <Text style={styles.subtitle}>
                        This will permanently delete{' '}
                        <Text style={styles.boldText}>{dependentName ? `"${dependentName}"` : 'this dependent profile'}</Text>.
                        {' '}This action cannot be undone.
                    </Text>

                    <Pressable style={[styles.deleteButton, loading && styles.buttonDisabled]} onPress={onConfirm} disabled={loading}>
                        <Text style={styles.deleteButtonText}>{loading ? 'Deleting...' : 'Delete'}</Text>
                    </Pressable>

                    <Pressable style={styles.cancelButton} onPress={onCancel} disabled={loading}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111',
    },
    subtitle: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        lineHeight: 20,
    },
    boldText: {
        fontWeight: '700',
        color: '#111',
    },
    deleteButton: {
        backgroundColor: '#e30016',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    deleteButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    cancelButton: {
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eef0f8',
        backgroundColor: '#f7f8ff',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
});
