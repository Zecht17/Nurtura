import DependentOption from '@/components/cards/dependentOption';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type AddDependentModalProps = {
	visible: boolean;
	onClose: () => void;
	dependents?: string[];
	selectedDependent?: string | null;
	onSelectDependent?: (name: string) => void;
	onAddDependent?: (name: string) => void;
};

export default function AddDependentModal({
	visible,
	onClose,
	dependents = ['Emma Johnson', 'Robert Thompson'],
	selectedDependent,
	onSelectDependent,
	onAddDependent,
}: AddDependentModalProps) {
	const [localSelection, setLocalSelection] = React.useState<string | null>(selectedDependent ?? null);

	React.useEffect(() => {
		if (!visible) {
			return;
		}

		setLocalSelection(selectedDependent ?? null);
	}, [visible, selectedDependent]);

	const handleSelect = (name: string) => {
		setLocalSelection(name);
		onSelectDependent?.(name);
	};

	const handleAdd = () => {
		if (!localSelection) {
			return;
		}

		onAddDependent?.(localSelection);
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.card}>
					<Text style={styles.title}>Add Dependent</Text>
					<Text style={styles.subtitle}>Select a dependent to add to this care space</Text>

					<View style={styles.optionsContainer}>
						{dependents.map((name) => (
							<View
								key={name}
								style={[
									styles.optionWrapper,
									localSelection === name ? styles.selectedOption : null,
								]}
							>
								<DependentOption name={name} onPress={() => handleSelect(name)} />
							</View>
						))}
					</View>

					<Pressable
						onPress={handleAdd}
						disabled={!localSelection}
						style={({ pressed }) => [
							styles.addButtonWrapper,
							localSelection ? (pressed ? { opacity: 0.85 } : null) : styles.disabledButton,
						]}
					>
						<LinearGradient
							colors={['#7C6FDC', '#9C88F2']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.addButton}
						>
							<Text style={styles.addButtonText}>Add Dependent</Text>
						</LinearGradient>
					</Pressable>

					<Pressable onPress={onClose} style={({ pressed }) => [styles.cancelButton, pressed ? { opacity: 0.8 } : null]}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	card: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: '#F4F4F8',
		borderRadius: 12,
        padding: 20,
		// paddingHorizontal: 14,
		// paddingVertical: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1F1F2B',
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		marginTop: 6,
		marginBottom: 12,
	},
	optionsContainer: {
		gap: 10,
	},
	optionWrapper: {
		borderRadius: 12,
	},
	selectedOption: {
		borderWidth: 2,
		borderColor: '#7C6FDC',
	},
	addButtonWrapper: {
		marginTop: 14,
		borderRadius: 12,
		overflow: 'hidden',
	},
	addButton: {
		paddingVertical: 12,
		alignItems: 'center',
	},
	addButtonText: {
		fontSize: 15,
		color: '#FFFFFF',
		fontWeight: '500',
	},
	disabledButton: {
		opacity: 0.55,
	},
	cancelButton: {
		marginTop: 10,
		paddingVertical: 12,
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#CFD0D8',
		backgroundColor: '#F5F5F7',
	},
	cancelButtonText: {
		fontSize: 15,
		color: '#222',
		fontWeight: '500',
	},
});
