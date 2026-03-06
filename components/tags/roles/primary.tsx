import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

export type OwnerBadgeProps = {
    label?: string;
};

export default function PrimaryBadge({ label = "primary" }: OwnerBadgeProps) {
    return (
        <View style={styles.ownerBadge}>
            <Ionicons name="shield-outline" size={14} color="#7C6FDC" />
            <Text style={styles.ownerText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    ownerBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#E8E4F8",
        padding: 6,
        borderRadius: 14,
        paddingHorizontal: 10,
    },

    ownerText: {
        fontSize: 14,
        color: "#7C6FDC",
        marginLeft: 4,
    },
});
