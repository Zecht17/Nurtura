import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type TaskCardActiveProps = {
    title: string;
    dependent: string;
    description: string;
    statusTags?: ReactNode;
    dateTag?: ReactNode;
};

export default function TaskCardActive({
    title,
    dependent,
    description,
    statusTags,
    dateTag,
}: TaskCardActiveProps) {
    return (
        <View style={styles.card}>
            <View style={styles.radioRow}>
                <View style={styles.radioWrapper}>
                    <View style={[styles.customRadio, styles.customRadioSelected]}>
                        <View style={styles.customRadioDot} />
                    </View>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
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
