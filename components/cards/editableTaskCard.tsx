import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TaskCardProps = {
    value: string;
    selectedTask: string | null;
    onSelect: (value: string) => void;
    title: string;
    dependent: string;
    description: string;
    statusTags?: ReactNode;
    dateTag?: ReactNode;
};

export default function EditableTaskCard({
    value,
    selectedTask,
    onSelect,
    title,
    dependent,
    description,
    statusTags,
    dateTag,
}: TaskCardProps) {
    const isSelected = selectedTask === value;

    return (
        <View style={styles.card}>
            <View style={styles.radioRow}>
                <Pressable onPress={() => onSelect(value)} style={styles.radioWrapper}>
                    <View style={[styles.customRadio, isSelected && styles.customRadioSelected]}>
                        {isSelected && <View style={styles.customRadioDot} />}
                    </View>
                </Pressable>
                <View style={styles.content}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.title}>{title}</Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <MaterialCommunityIcons name="pencil-outline" size={21} color="#000000" />
                            <Ionicons name="trash" size={21} color="red" />
                        </View>
                    </View>
                    <Text style={styles.subHeader}>{dependent}</Text>
                    <Text style={styles.subHeader}>{description}</Text>
                </View>
            </View>
            {statusTags ? <View style={styles.statusRow}>{statusTags}</View> : null}
            {dateTag ? <View style={styles.statusRow}>{dateTag}</View> : null}
        </View>
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
