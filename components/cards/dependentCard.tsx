import SmallAddTaskButton from '@/components/buttons/smallAddTask';
import ViewTaskButton from '@/components/buttons/viewTaskButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

type DependentCardProps = {
	fullName: string;
	username?: string;
	age: number;
	careNotes: string;
	onOpenProfile?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
};

export default function DependentCard({
	fullName,
	username,
	age,
	careNotes,
	onOpenProfile,
	onEdit,
	onDelete,
}: DependentCardProps) {
	const handleCardPress = () => {
		onOpenProfile?.();
	};

	const handleEditPress = (event: GestureResponderEvent) => {
		event.stopPropagation();
		onEdit?.();
	};

	const handleDeletePress = (event: GestureResponderEvent) => {
		event.stopPropagation();
		onDelete?.();
	};

	return (
		<Pressable
			style={({ pressed }) => [
				styles.dependentContainer,
				onOpenProfile ? { opacity: pressed ? 0.92 : 1 } : null,
			]}
			onPress={onOpenProfile ? handleCardPress : undefined}
		>
			<View style={styles.profileRow}>
				<View style={styles.iconBg}>
					<Octicons name="person" size={33} color="white" />
				</View>

				<View style={styles.infoColumn}>
					<View style={styles.infoRow}>
						<Text style={styles.infoText}>{fullName}</Text>
						<View style={styles.actionsRow}>
							<Pressable style={styles.actionButton} onPress={handleEditPress}>
								<MaterialCommunityIcons name="pencil-outline" size={21} color="#000000" />
							</Pressable>
							<Pressable style={styles.actionButton} onPress={handleDeletePress}>
								<Ionicons name="trash" size={21} color="red" />
							</Pressable>
						</View>
					</View>
					<View style={styles.metaRow}>
						<Text style={styles.infoSubText}>Username: {username || '-'}</Text>
						<Text style={styles.infoSubText}>Age: {age}</Text>
					</View>
				</View>
			</View>

			<View style={styles.genInfo}>
				<Text style={styles.geninfoSubText}>Care Notes:</Text>
				<View style={styles.infoGroup}>
					<Text style={styles.infoSubText}>• {careNotes}</Text>
				</View>

				<View style={styles.buttonRow}>
					<ViewTaskButton onPress={onOpenProfile} label="View Profile" />
					<SmallAddTaskButton />
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	dependentContainer: {
		margin: 15,
		marginBottom: 0,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 15,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 15,
	},
	iconBg: {
		width: 60,
		height: 60,
		borderRadius: 35,
		backgroundColor: '#7C6FDC',
		justifyContent: 'center',
		alignItems: 'center',
	},
	infoColumn: {
		flexDirection: 'column',
		gap: 4,
		flex: 1,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		justifyContent: 'space-between',
		flex: 1,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	actionsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flexShrink: 0,
		marginLeft: 'auto',
	},
	actionButton: {
		width: 34,
		height: 28,
		borderRadius: 12,
		backgroundColor: '#f5f6f8',
		borderColor: '#e5e6eb',
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	infoText: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	infoSubText: {
		fontSize: 14,
		color: '#666',
	},
	geninfoSubText: {
		fontSize: 14,
		color: '#666',
		paddingTop: 5,
	},
	genInfo: {
		marginTop: 10,
		marginLeft: 75,
		paddingBottom: 10,
		borderTopWidth: 1,
		borderTopColor: '#b3b3b3be',
	},
	infoGroup: {
		flexDirection: 'column',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: 10,
		gap: 10,
	},
});
