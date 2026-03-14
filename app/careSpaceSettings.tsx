import OwnerBadge from "@/components/tags/roles/owner";
import PrimaryBadge from "@/components/tags/roles/primary";
import { Feather } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CareSpaceSettings() {
    StatusBar.setBarStyle("dark-content");
    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <View>
                            {/* This is for the name of the Care Person */}
                            <Text style={styles.headerTitle}>Emma's Care</Text>
                            <Text style={styles.subHeader}>Care Space Settings</Text>
                        </View>
                    </View>

                    {/* This is the container for the Care Space Information */}
                    <View style={styles.careInfoContainer}>
                        <View style={styles.careInfoRow}>
                        <Text style={styles.careInfoTitle}>Care Space Information</Text>
                        <Pressable style={styles.editButton} onPress={() => router.push("/editCareSpaceSettings")}>
                            <Feather name="edit" size={16} color="black" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>
                        </View>

                        {/* This is for the Care Space Details */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontSize: 14, color: "#555" }}>Care Space Name</Text>
                            <Text style={{ fontSize: 16, color: "black", fontWeight: "400" }}>Emma's Care</Text>
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontSize: 14, color: "#555" }}>Description</Text>
                            <Text style={{ fontSize: 16, color: "black", fontWeight: "400" }}>Case for Emma</Text>
                        </View>
                    </View>

                    {/* This is for the Caregiver card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialIcons name="people-alt" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Caregivers</Text>
                                <Text style={styles.careInfoTitle}>(2)</Text>
                            </View>
                        
                        <Pressable style={styles.editButton}>
                            <FontAwesome6 name="add" size={14} color="black" />
                            <Text style={styles.editButtonText}>Add Caregiver</Text>
                        </Pressable>
                        </View>

                        {/* This is for the Caregiver Details */}
                        <View style={styles.caregiverDetails}>
                            <View style={styles.caregiverInfoRow}>
                                <View style={styles.caregiverTitle}>
                                    <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>J</Text></View>
                                    <View style={styles.caregiverDetailsRow}>
                                        <Text style={styles.caregiverName}>John Doe</Text>
                                        <Text style={styles.caregiverEmail}>john@example.com</Text>
                                    </View>
                                </View>
                                <OwnerBadge />
                            </View>
                        </View>

                        <View style={styles.caregiverDetails}>
                            <View style={styles.caregiverInfoRow}>
                                <View style={styles.caregiverTitle}>
                                    <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>J</Text></View>
                                    <View style={styles.caregiverDetailsRow}>
                                        <Text style={styles.caregiverName}>Juztine Miguel</Text>
                                        <Text style={styles.caregiverEmail}>juztine@example.com</Text>
                                    </View>
                                </View>
                                <PrimaryBadge />
                            </View>
                        </View>
                    </View>

                    {/* This is for the Dependent card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialCommunityIcons name="baby-face" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Dependents</Text>
                                <Text style={styles.careInfoTitle}>(1)</Text>
                            </View>
                        
                        <Pressable style={styles.editButton}>
                            <FontAwesome6 name="add" size={14} color="black" />
                            <Text style={styles.editButtonText}>Add Dependent</Text>
                        </Pressable>
                        </View>

                        {/* This is for the Dependent Details */}
                        <View style={styles.dependentDetails}>
                            <View style={styles.caregiverInfoRow}>
                                <View style={styles.caregiverTitle}>
                                    <View style={styles.dependentItem}><Text style={styles.dependentIcon}>E</Text></View>
                                    <View style={styles.dependentDetailsRow}>
                                        <Text style={styles.dependentName}>Emma Johnson</Text>
                                        <Text style={styles.dependentEmail}>child</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
        paddingBottom: 0,
    },

    headerContainer: {
        paddingTop: 0,
        paddingBottom: 0,
        // padding: 15,
        flexDirection: "row",
        gap: 12,
        // justifyContent: "space-between",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },

    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    careInfoContainer: {
        marginTop: 30,
        backgroundColor: "#fff",
        paddingBottom: 25,
        padding: 20,
        borderRadius: 12,
    },

    caregiverInfoContainer: {
        marginTop: 20,
        backgroundColor: "#fff",
        paddingBottom: 25,
        padding: 20,
        borderRadius: 12,
    },

    careInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },

    careInfoTitle: {
        fontSize: 18,
        // fontWeight: "bold",
    },

    editButton: {
        backgroundColor: "#ffffff",
        borderColor: "#5e5e5e73",
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    editButtonText: {
        color: "#333",
        fontSize: 14,
    },

    // Caregiver Card Styles
    caregiverTitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    caregiverInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 8,
    },

    caregiverItem: {
        backgroundColor: "#7C6FDC",
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 100,
    },

    careGiverIcon: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    caregiverName: {
        fontSize: 16,
        color: "#333",
    },

    caregiverEmail: {
        fontSize: 14,
        color: "#777",
    },

    caregiverDetailsRow: {
        flexDirection: "column",
        gap: 4,
    },

    caregiverNameRow: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        alignContent: "center",
    },

    backupText: {
        fontSize: 14,
        color: "#999",
    },

    caregiverDetails: {
        marginTop: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 14,
    },

    // Dependent Card Styles
    dependentDetails: {
        marginTop: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 14,
    },

    dependentItem: {
        backgroundColor: "#9B6CF0",
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 100,
    },

    dependentIcon: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    dependentName: {
        fontSize: 16,
        color: "#333",
    },

    dependentEmail: {
        fontSize: 14,
        color: "#777",
    },

    dependentDetailsRow: {
        flexDirection: "column",
        gap: 4,
    },
});