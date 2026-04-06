import { getResponsiveTokens } from "@/utils/responsive";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type TaskCardProps = {
    value: string;
    selectedTask: string | null;
    onSelect: (value: string) => void;
    isCompleted?: boolean;
    onRadioPress?: () => void;
    title: string;
    dependent: string;
    description: string;
    statusTags?: ReactNode;
    dateTag?: ReactNode;
    onEdit?: () => void;
    onPress?: () => void;
    onDelete?: () => void;
    /** Family / caregiver: show edit, delete, complete. Dependents: view-only. */
    editable?: boolean;
};

export default function EditableTaskCard({
    value,
    selectedTask,
    onSelect,
    isCompleted = false,
    onRadioPress,
    title,
    dependent,
    description,
    statusTags,
    dateTag,
    onEdit,
    onPress,
    onDelete,
    editable = true,
}: TaskCardProps) {
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const cardTitleSize = Math.max(20, Math.min(24, width * 0.055));
    const cardBodySize = Math.max(13, Math.min(16, width * 0.04));
    const selectionHighlight = editable && onRadioPress == null && selectedTask === value;
    const radioFilled = isCompleted || selectionHighlight;

    const handleRadioPress = () => {
        if (!editable) return;
        if (onRadioPress) {
            onRadioPress();
        } else {
            onSelect(value);
        }
    };

    return (
        <Pressable
            onPress={onPress ?? (editable ? () => onSelect(value) : undefined)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.radioRow}>
                {editable ? (
                    <Pressable onPress={handleRadioPress} style={styles.radioWrapper}>
                        <View style={[styles.customRadio, radioFilled && styles.customRadioSelected]}>
                            {radioFilled && <View style={styles.customRadioDot} />}
                        </View>
                    </Pressable>
                ) : (
                    <View style={styles.radioWrapper}>
                        <View style={[styles.customRadio, radioFilled && styles.customRadioSelected]}>
                            {radioFilled && <View style={styles.customRadioDot} />}
                        </View>
                    </View>
                )}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { fontSize: cardTitleSize }]} allowFontScaling={false}>{title}</Text>
                        {editable ? (
                            <View style={styles.actionsRow}>
                                <Pressable onPress={onEdit} hitSlop={8}>
                                    <MaterialCommunityIcons name="pencil-outline" size={21} color="#000000" />
                                </Pressable>
                                <Pressable onPress={onDelete} hitSlop={8}>
                                    <Ionicons name="trash" size={21} color="red" />
                                </Pressable>
                            </View>
                        ) : null}
                    </View>
                    <Text style={[styles.subHeader, { fontSize: cardBodySize }]} allowFontScaling={false}>{dependent}</Text>
                    <Text style={[styles.subHeader, { fontSize: cardBodySize }]} allowFontScaling={false}>{description}</Text>
                </View>
            </View>
            {statusTags ? <View style={styles.statusRow}>{statusTags}</View> : null}
            {dateTag ? <View style={styles.statusRow}>{dateTag}</View> : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        alignContent: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
    },
    cardPressed: {
        opacity: 0.9,
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 5,
    },
    radioWrapper: {
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    customRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#cccc",
        justifyContent: "center",
        alignItems: "center",
    },
    customRadioSelected: {
        backgroundColor: "#7C6FDC",
    },
    customRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ffffff",
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        flexShrink: 0,
        marginTop: 2,
    },
    title: {
        fontWeight: "bold",
        fontSize: 21,
        color: "#000000",
        flex: 1,
        flexShrink: 1,
    },
    subHeader: {
        fontSize: 15,
        color: "#666",
        marginTop: 5,
        flexShrink: 1,
    },
    statusRow: {
        paddingLeft: 35,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 10,
    },
});
