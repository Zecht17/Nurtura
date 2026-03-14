import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface AddCaregiverModalProps {
	visible: boolean;
	code?: string;
	onClose: () => void;
	onAddCaregiver?: () => void;
}

export default function AddCaregiverModal({
	visible,
	code = "AFTUPD",
	onClose,
	onAddCaregiver,
}: AddCaregiverModalProps) {
	const formattedCode = React.useMemo(() => {
		const compactCode = code.replace(/\s|-/g, "").toUpperCase();
		const groups = compactCode.match(/.{1,3}/g);
		return groups ? groups.join(" - ") : compactCode;
	}, [code]);

	const handleCopy = async () => {
		try {
			await Clipboard.setStringAsync(formattedCode.replace(/\s|-/g, ""));
		} catch (error) {
			// Swallow errors; copying is a convenience feature.
		}
	};

	const handleAddCaregiver = () => {
		if (onAddCaregiver) {
			onAddCaregiver();
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.card}>
					<Pressable style={styles.closeButton} onPress={onClose}>
						<FontAwesome6 name="xmark" size={16} color="#666" />
					</Pressable>

					<Text style={styles.title}>Add Caregiver</Text>
					<Text style={styles.subtitle}>
						Share the care space code below or manually add a caregiver
					</Text>

					<Text style={styles.label}>Care Space Code</Text>

					<View style={styles.codeRow}>
						<Text style={styles.codeText}>{formattedCode}</Text>
						<Pressable style={styles.copyButton} onPress={handleCopy}>
							<FontAwesome6 name="copy" size={18} color="#7C6FDC" />
						</Pressable>
					</View>

					<Text style={styles.helpText}>
						Share this code with caregivers to let them join this care space. They can enter it using the "Join Care Space" button.
					</Text>

					<Pressable onPress={handleAddCaregiver} style={styles.ctaWrapper}>
						<LinearGradient
							colors={["#7C6FDC", "rgb(137, 94, 170)"]}
                            start={{ x: 0.3706, y: 0.0171 }}
                            end={{ x: 0.6294, y: 1 }}
							style={styles.ctaButton}
						>
							<Text style={styles.ctaText}>Add Caregiver</Text>
						</LinearGradient>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	card: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		width: "100%",
		maxWidth: 360,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
	},
	closeButton: {
		position: "absolute",
		top: 12,
		right: 12,
		padding: 6,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#222",
		textAlign: "center",
		marginTop: 4,
	},
	subtitle: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginTop: 8,
		marginBottom: 18,
		lineHeight: 20,
	},
	label: {
		fontSize: 13,
		color: "#444",
		marginBottom: 8,
		marginTop: 4,
	},
	codeRow: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		backgroundColor: "#f8f8f8",
		paddingHorizontal: 14,
		paddingVertical: 12,
		gap: 10,
	},
	codeText: {
		flex: 1,
		fontSize: 18,
		letterSpacing: 2,
		color: "#333",
		fontWeight: "700",
		textAlign: "center",
	},
	copyButton: {
		padding: 6,
	},
	helpText: {
		fontSize: 12,
		color: "#777",
		marginTop: 12,
		lineHeight: 18,
	},
	ctaWrapper: {
		marginTop: 18,
	},
	ctaButton: {
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
	},
	ctaText: {
		color: "#ffffff",
		fontSize: 16,
		// fontWeight: "700",
	},
});
