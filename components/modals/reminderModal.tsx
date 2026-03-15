import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type ReminderModalProps = {
	dueDate: Date;
	dueTime: Date;
	title?: string;
	message?: string;
	onClose: () => void;
	checkIntervalMs?: number;
};

export default function ReminderModal({
	dueDate,
	dueTime,
	title = "Reminder",
	message = "You have a task due now.",
	onClose,
	checkIntervalMs = 1000,
}: ReminderModalProps) {
	const [visible, setVisible] = React.useState(false);
	const targetMs = React.useMemo(() => {
		if (!dueDate || !dueTime) return null;
		const combined = new Date(dueDate);
		combined.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
		return combined.getTime();
	}, [dueDate, dueTime]);

	React.useEffect(() => {
		if (!targetMs) return undefined;
		let triggered = false;
		const id = setInterval(() => {
			if (!triggered && Date.now() >= targetMs) {
				triggered = true;
				setVisible(true);
			}
		}, Math.max(500, checkIntervalMs));
		return () => clearInterval(id);
	}, [targetMs, checkIntervalMs]);

	if (!targetMs) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={() => {
				setVisible(false);
				onClose();
			}}
		>
			<View style={styles.overlay}>
				<View style={styles.modalContainer}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.message}>{message}</Text>

					<View style={styles.buttonRow}>
						<Pressable
							style={[styles.button, styles.dismissButton]}
							onPress={() => {
								setVisible(false);
								onClose();
							}}
						>
							<Text style={styles.dismissText}>Dismiss</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.35)",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	modalContainer: {
		width: "100%",
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 8,
		color: "#111",
	},
	message: {
		fontSize: 15,
		color: "#444",
		marginBottom: 16,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 10,
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#7C6FDC",
	},
	dismissButton: {
		backgroundColor: "#7C6FDC",
	},
	dismissText: {
		color: "#ffffff",
		fontWeight: "600",
		fontSize: 15,
		textAlign: "center",
	},
});
