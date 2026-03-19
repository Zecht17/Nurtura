import AddDependentsButton from "@/components/buttons/addDependents";
import ChildDependentCard from "@/components/cards/childDependent";
import ElderlyDependentCard from "@/components/cards/elderlyDependent";
import GeneralDependentCard from "@/components/cards/generalDependent";
import { NoDependentCard } from "@/components/cards/noDependent";
import SpecialDependentCard from "@/components/cards/specialDependent";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dependent, useDependents } from "../context/DependentContext";

export default function dependentProfile() {
    const { dependents: dependentList } = useDependents();
    const router = useRouter();

    StatusBar.setBarStyle("dark-content");

    const getAge = (birthDate: string) => {
        const match = birthDate.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (!match) return 0;

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        const dob = new Date(year, month, day);

        if (isNaN(dob.getTime())) return 0;

        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());

        if (beforeBirthday) age -= 1;
        return age < 0 ? 0 : age;
    };

    const renderDependentCard = (dependent: Dependent) => {
        const commonProps = {
            key: dependent.id,
            name: dependent.name,
            age: getAge(dependent.birthDate),
            birthday: dependent.birthDate,
            careNotes: dependent.careNotes || 'No care notes added.',
            notes: dependent.notes || 'No additional notes added.',
            onEdit: () => router.push({ pathname: '/editDependent', params: { dependentId: dependent.id } }),
        };

        switch (dependent.type) {
            case 'Child':
                return <ChildDependentCard {...commonProps} />;
            case 'Elderly':
                return <ElderlyDependentCard {...commonProps} />;
            case 'Special Needs':
                return <SpecialDependentCard {...commonProps} />;
            case 'General':
            default:
                return <GeneralDependentCard {...commonProps} />;
        }
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={dependents.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={dependents.container}>
                        <View style={dependents.headerContainer}>
                            <View>
                                <Text style={dependents.headerTitle}>Dependent Profile</Text>
                                <Text style={dependents.subHeader}>Manage your dependent's{"\n"}information and preferences</Text>
                            </View>
                            <AddDependentsButton />
                        </View>

                        {dependentList.length === 0 ? (
                            <View style={dependents.emptyStateContainer}>
                                <NoDependentCard />
                            </View>
                        ) : (
                            dependentList.map(renderDependentCard)
                        )}

                    </View>
                </ScrollView>

            </SafeAreaView>
        </LinearGradient>
    );
}

const dependents = StyleSheet.create({
    container: {
        padding: 10,
        // paddingTop: 0,
        // paddingBottom: 0,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    emptyStateContainer: {
        marginHorizontal: 15,
        marginTop: 10,
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