import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddDependentsButton from "@/components/buttons/addDependents";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ChildTypeTag from "@/components/tags/type/child";
import { Pressable } from "react-native";
import SmallAddTaskButton from "@/components/buttons/smallAddTask";
import ViewTaskButton from "@/components/buttons/viewTaskButton";
import Octicons from "@expo/vector-icons/Octicons";
import ElderlyTypeTag from "@/components/tags/type/elderly";

export default function dependentProfile() {

    StatusBar.setBarStyle("dark-content");

    const birthday = "May 15, 2019";
    const careNotes = "Allergic to peanuts.";
    const notes = "Loves story time before bed.";

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={dependents.container}>
                    <View style={dependents.headerContainer}>
                        <View>
                            <Text style={dependents.headerTitle}>Dependent Profile</Text>
                            <Text style={dependents.subHeader}>Manage your dependent's{"\n"}information and preferences</Text>
                        </View>
                        <AddDependentsButton />
                    </View>

                    {/* This section is for the dependent info  */}
                    <View style={dependents.dependentContainer}>
                        <View style={dependents.profileRow}>
                            <View style={dependents.iconBg}>
                                <MaterialCommunityIcons name="baby-face-outline" size={33} color="white" />
                            </View>

                            {/* Info Column */}
                            <View style={dependents.infoColumn}>
                                <View style={dependents.infoRow}>
                                    <Text style={dependents.infoText}>Emma Johnson</Text>
                                    <View style={dependents.actionsRow}>
                                        <Pressable style={dependents.actionButton}>
                                            <MaterialCommunityIcons name="pencil-outline" size={21} color="#000000" />
                                        </Pressable>
                                        <Pressable style={dependents.actionButton}>
                                            <Ionicons name="trash" size={21} color="red" />
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={dependents.metaRow}>
                                    <ChildTypeTag />
                                    <Text style={dependents.infoSubText}>Age: 6</Text>
                                </View>                            
                            </View>
                        </View>
                        {/* This is where the other info goes */}
                        <View style={dependents.genInfo}>
                            <Text style={dependents.geninfoSubText}>Date of Birth: {birthday}</Text>
                            <View style={{flexDirection: "column"}}>
                                <Text style={dependents.infoSubText}>Care Notes:</Text>
                                <Text style={dependents.infoSubText}>• {careNotes}</Text>
                            </View>
                            <View style={{flexDirection: "column"}}>
                                <Text style={dependents.infoSubText}>Notes:</Text>
                                <Text style={dependents.infoSubText}>• {notes}</Text>
                            </View>

                             {/* This is where the button goes */}
                             <View style={{flexDirection: "row", justifyContent: "flex-start", marginTop: 10, gap: 10}}>
                                <ViewTaskButton />
                                 <SmallAddTaskButton />
                             </View>
                        </View>
                        
                    </View>

                    {/* This section is the 2nd dependent info  */}
                    <View style={dependents.dependentContainer}>
                        <View style={dependents.profileRow}>
                            <View style={dependents.iconBg}>
                                <Octicons name="person" size={33} color="white" />
                            </View>

                            {/* Info Column */}
                            <View style={dependents.infoColumn}>
                                <View style={dependents.infoRow}>
                                    <Text style={dependents.infoText}>Robert Thompson</Text>
                                    <View style={dependents.actionsRow}>
                                        <Pressable style={dependents.actionButton}>
                                            <MaterialCommunityIcons name="pencil-outline" size={21} color="#000000" />
                                        </Pressable>
                                        <Pressable style={dependents.actionButton}>
                                            <Ionicons name="trash" size={21} color="red" />
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={dependents.metaRow}>
                                    <ElderlyTypeTag />
                                    <Text style={dependents.infoSubText}>Age: 77</Text>
                                </View>                            
                            </View>
                        </View>
                        {/* This is where the other info goes */}
                        <View style={dependents.genInfo}>
                            <Text style={dependents.geninfoSubText}>Date of Birth: {birthday}</Text>
                            <View style={{flexDirection: "column"}}>
                                <Text style={dependents.infoSubText}>Care Notes:</Text>
                                <Text style={dependents.infoSubText}>• {careNotes}</Text>
                            </View>
                            <View style={{flexDirection: "column"}}>
                                <Text style={dependents.infoSubText}>Notes:</Text>
                                <Text style={dependents.infoSubText}>• {notes}</Text>
                            </View>

                             {/* This is where the button goes */}
                             <View style={{flexDirection: "row", justifyContent: "flex-start", marginTop: 10, gap: 10}}>
                                <ViewTaskButton />
                                 <SmallAddTaskButton />
                             </View>
                        </View>
                        
                    </View>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const dependents = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        // paddingTop: 0,
        // paddingBottom: 0,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 15,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 0,
    },


    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 8,
    },
    headerIcon: {
        marginTop: 18,
    },

    dependentContainer: {
        // flex: 1,
        margin: 15,
        marginBottom: 0,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
    },

    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },

    // Icon background style
    iconBg: {
        width: 60,
        height: 60,
        borderRadius: 35,
        backgroundColor: "#7C6FDC",
        justifyContent: "center",
        alignItems: "center",
    },

    infoColumn: {
        flexDirection: "column",
        gap: 4,
        flex: 1,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
        flex: 1, // let the row fill available space so actions stay right-aligned
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        marginLeft: "auto", // push actions to the far right
    },

    actionButton: {
        width: 34,
        height: 28,
        borderRadius: 12,
        backgroundColor: "#f5f6f8",
        borderColor: "#e5e6eb",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    infoText: {
        fontSize: 18,
        fontWeight: "bold",
        // flexShrink: 1,
    },

    infoSubText: {
        fontSize: 14,
        color: "#666",
    },

    geninfoSubText: {
        fontSize: 14,
        color: "#666",
        paddingTop: 5,
    },

    genInfo: {
        marginTop: 10,
        marginLeft: 75, // align with text, accounting for icon width + gap
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: "#b3b3b3be",
    },
});