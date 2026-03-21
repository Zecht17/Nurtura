import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type DependentOptionProps = {
	name: string;
	onPress?: () => void;
};

export default function DependentOption({ name, onPress }: DependentOptionProps) {
	const initial = name.trim().charAt(0).toUpperCase() || '?';

	return (
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			style={({ pressed }) => [styles.container, onPress ? { opacity: pressed ? 0.9 : 1 } : null]}
		>
			<View style={styles.initialIcon}>
				<Text style={styles.initialIconText}>{initial}</Text>
			</View>
			<Text style={styles.nameText}>{name}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		padding: 8,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 12,
	},
	initialIcon: {
		width: 30,
		height: 30,
		borderRadius: 25,
		backgroundColor: '#7C6FDC',
		justifyContent: 'center',
		alignItems: 'center',
	},
	initialIconText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#ffffff',
	},
	nameText: {
		fontSize: 16,
		color: '#333',
	},
});