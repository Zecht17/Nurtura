import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TaskCardProps = {
    value: string;
    selectedTask: string | null;
    onSelect: (value: string) => void;
    /** When true, radio shows the completed (filled) style — use after server confirms completion */
    isCompleted?: boolean;
    /** If set, radio calls this instead of onSelect (e.g. open complete confirmation). Omit for selection-only. */
    onRadioPress?: () => void;
    title: string;
    dependent: string;
    description: string;
    statusTags?: ReactNode;
    dateTag?: ReactNode;
    onPress?: () => void;
};

export default function TaskCard({
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
    onPress,
}: TaskCardProps) {
    const selectionHighlight = onRadioPress == null && selectedTask === value;
    const radioFilled = isCompleted || selectionHighlight;

    const handleRadioPress = () => {
        if (onRadioPress) {
            onRadioPress();
        } else {
            onSelect(value);
        }
    };

    return (
        <Pressable
            onPress={onPress ?? (() => onSelect(value))}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.radioRow}>
                <Pressable onPress={handleRadioPress} style={styles.radioWrapper}>
                    <View style={[styles.customRadio, radioFilled && styles.customRadioSelected]}>
                        {radioFilled && <View style={styles.customRadioDot} />}
                    </View>
                </Pressable>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subHeader}>{dependent}</Text>
                    <Text style={styles.subHeader}>{description}</Text>
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
    title: {
        fontWeight: "bold",
        fontSize: 24,
        color: "#000000",
    },
    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },
    statusRow: {
        paddingLeft: 35,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
});
