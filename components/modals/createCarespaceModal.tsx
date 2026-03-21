import DependentOption from "@/components/cards/dependentOption";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-paper";

interface CreateCarespaceModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate?: (payload: { name: string; description: string; type: string; selectedDependent: string | null }) => void;
}

export default function CreateCarespaceModal({ visible, onClose, onCreate }: CreateCarespaceModalProps) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [type, setType] = useState("Select Type");
    const [selectedDependent, setSelectedDependent] = useState<string | null>(null);
    const [typeMenuVisible, setTypeMenuVisible] = useState(false);
    const dependents = ["Emma Johnson", "Robert Thompson"];

    React.useEffect(() => {
        if (visible) {
            // Reset fields when opened to mimic a fresh form
            setName("");
            setDescription("");
            setType("Select Type");
            setSelectedDependent(null);
        }
    }, [visible]);

    const handleCreate = () => {
        if (onCreate) {
            onCreate({
                name: name.trim(),
                description: description.trim(),
                type,
                selectedDependent,
            });
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <FontAwesome6 name="xmark" size={16} color="#666" />
                    </Pressable>

                    <Text style={styles.title}>Create New Care Space</Text>
                    <Text style={styles.subtitle}>Set up a collaborative space for coordinating care</Text>

                    <Text style={styles.inputTitle}>Care Space Name *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Emma's Care"
                        mode="outlined"
                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                        style={[styles.input, styles.inputField]}
                        activeOutlineColor="#7C6FDC"
                    />

                    <Text style={styles.inputTitle}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe the purpose of this care space..."
                        mode="outlined"
                        multiline
                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                        style={[styles.input, styles.inputField, styles.textArea]}
                        activeOutlineColor="#7C6FDC"
                    />
                    
                    <View style={styles.addDependentCollumn}>
                        <Text style={styles.dependentTitle}>Add Dependent</Text>
                        <Text style={styles.inputTitle}>Select a dependent to add to this care space</Text>
                    </View>
                    
                    {/* This is where the dependent selection will go */}
                    <View style={styles.depOptionsContainer}>
                        {dependents.map((dependentName) => (
                            <Pressable
                                key={dependentName}
                                onPress={() => setSelectedDependent(dependentName)}
                                style={({ pressed }) => [
                                    styles.optionWrapper,
                                    selectedDependent === dependentName ? styles.selectedOption : null,
                                    pressed ? styles.pressedOption : null,
                                ]}
                            >
                                <DependentOption name={dependentName} />
                            </Pressable>
                        ))}
                    </View>
                    

                    <Pressable onPress={handleCreate} style={styles.ctaWrapper}>
                        <LinearGradient
                            colors={["#7C6FDC", "#9C88F2"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaButton}
                        >
                            <Text style={styles.ctaText}>Create Care Space</Text>
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
        maxWidth: 400,
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
        marginTop: 6,
    },
    // input: {
    //     backgroundColor: "#f8f8f8",
    //     borderRadius: 12,
    //     borderWidth: 1,
    //     borderColor: "#f0f0f0",
    //     paddingHorizontal: 14,
    //     paddingVertical: 12,
    //     fontSize: 16,
    //     color: "#333",
    // },
    textArea: {
        minHeight: 90,
        textAlignVertical: "top",
    },
    // dropdown: {
    //     backgroundColor: "#f8f8f8",
    //     borderRadius: 12,
    //     borderWidth: 1,
    //     borderColor: "#f0f0f0",
    //     paddingHorizontal: 14,
    //     paddingVertical: 12,
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    // },
    placeholderText: {
        color: "#999",
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

    inputTitle: {
        fontSize: 16,
        color: "#2b2b2b",
        marginBottom: 6,
    },

    dependentTitle: {
        fontSize: 18,
        color: "black",
        fontWeight: "bold",
        marginBottom: 6,
    },

    subText: {
        color: "#7e7e7e",
        fontSize: 16,
        marginBottom: 24,
    },

    input: {
        marginBottom: 16,
    },

    inputField: {
        backgroundColor: "#ffffff",
        height: 45,  // to adjust the input smaller or bigger
    },

    inputRow: {
        flexDirection: "row",
        columnGap: 12,
    },

    inputGroup: {
        flex: 1,
    },

    button: {
        marginTop: 8,
    },

    dropdown: {
        // zIndex: 999,
        padding: 12,
        borderRadius: 16,
        width: "39%",
        marginVertical: 45,
    },

    dropdownContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
    },

    dropdownItemText: {
        color: "#111827",
    },

    addDependentCollumn: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // marginTop: 12,
        marginBottom: 12,
        padding: 12,
    },

    depOptionsContainer: {
        flexDirection: "column",
        gap: 12,
    },

    optionWrapper: {
        borderRadius: 12,
    },

    selectedOption: {
        borderWidth: 2,
        borderColor: "#7C6FDC",
        backgroundColor: "#F3EEFF",
    },

    pressedOption: {
        opacity: 0.9,
    },

});
