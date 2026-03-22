import CreateCarespaceModal from "@/components/modals/createCarespaceModal";
import JoinCareSpaceModal from "@/components/modals/joinCarespaceModal";
import type { CreateCareSpacePayload } from "@/context/CareSpacesContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type Props = {
    createStyle?: StyleProp<ViewStyle>;
    joinStyle?: StyleProp<ViewStyle>;
    onCreateCareSpace?: (payload: CreateCareSpacePayload) => Promise<void> | void;
    onJoinCareSpace?: (code: string) => Promise<void> | void;
};

export default function CareButtons({ createStyle, joinStyle, onCreateCareSpace, onJoinCareSpace }: Props) {
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [isJoinVisible, setIsJoinVisible] = useState(false);

    return (
        <View style={styles.buttonRow}>
            <Pressable
			style={({ pressed }) => [
				{ flex: 1 },
				{ opacity: pressed ? 0.5 : 1 },
				createStyle,
			]}
			onPress={() => setIsCreateVisible(true)}
		>
                <LinearGradient
                    colors={["#7C6FDC", "rgb(137, 94, 170)"]}
                    start={{ x: 0.3706, y: 0.0171 }}
                    end={{ x: 0.6294, y: 1 }}
                    style={[styles.createButton, styles.createButtonGradient]}
                >
                    <View style={styles.createButton}>
                        <FontAwesome6 name="add" size={16} color="white" />
                        <Text style={styles.cbuttonText}>Create Care Space</Text>
                    </View>
                </LinearGradient>
            </Pressable>

            <Pressable
            style={({ pressed }) => [
                { flex: 1 },
                { opacity: pressed ? 0.5 : 1 },
                joinStyle,
            ]}
            onPress={() => setIsJoinVisible(true)}
        >
                <LinearGradient
                    colors={["#ffffff", "#dbdbdb"]}
                    start={{ x: 0.3706, y: 0.0171 }}
                    end={{ x: 0.6294, y: 1 }}
                    style={[styles.joinButton, styles.joinButtonGradient]}
                >
                    <View style={styles.joinButton}>
                        <AntDesign name="user-add" size={16} color="#7C6FDC" />
                        <Text style={styles.jbuttonText}>Join Care Space</Text>
                    </View>
                </LinearGradient>
            </Pressable>

            <JoinCareSpaceModal
                visible={isJoinVisible}
                onClose={() => setIsJoinVisible(false)}
                onJoin={async (code) => {
                    await onJoinCareSpace?.(code);
                    setIsJoinVisible(false);
                }}
            />

            <CreateCarespaceModal
                visible={isCreateVisible}
                onClose={() => setIsCreateVisible(false)}
                onCreate={async (payload) => {
                    await onCreateCareSpace?.(payload);
                    setIsCreateVisible(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    buttonRow: {
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    gradientButton: {
        flex: 1,
        borderRadius: 14,
    },

    createButtonGradient: {
        marginRight: 8,
        borderColor: "#7C6FDC",
        borderWidth: 1,
    },

    joinButtonGradient: {
        marginLeft: 8,
        borderColor: "#7C6FDC",
        borderWidth: 1,
    },

    buttonContent: {
        padding: 10,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    primaryText: {
        color: "#fff",
        fontSize: 16,
    },

    secondaryText: {
        color: "#7C6FDC",
        fontSize: 16,
    },

    createButton: {
        // backgroundColor: "#7C6FDC",
        padding: 10,
        // paddingHorizontal: 20,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    cbuttonText: {
        color: "#fff",
        fontSize: 16,
        // fontWeight: "bold",
    },

    joinButton: {
        // backgroundColor: "#E0E0E0",
        padding: 10,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    jbuttonText: {
        color: "#7C6FDC",
        fontSize: 16,
        // fontWeight: "bold",
    },
});
