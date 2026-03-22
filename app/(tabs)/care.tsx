import CareButtons from "@/components/buttons/careSpaceButtons";
import CareContainerCard from "@/components/cards/careContainerCard";
import AddCaregiverModal from "@/components/modals/addCaregiverModal";
import AddDependentModal from "@/components/modals/addDependentModal";
import { styles } from "@/components/styles/care-css";
import { useCareSpaces } from "@/context/CareSpacesContext";
import { useDependents } from "@/context/DependentContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CareScreen() {
    const [isAddCaregiverVisible, setIsAddCaregiverVisible] = useState(false);
    const [isAddDependentVisible, setIsAddDependentVisible] = useState(false);
    const [activeCareSpaceId, setActiveCareSpaceId] = useState<string | null>(null);
    const { careSpaces, createCareSpace, joinCareSpaceViaCode, addDependentToCareSpace } = useCareSpaces();
    const { dependents } = useDependents();

    const activeCareSpace = useMemo(
        () => (activeCareSpaceId ? careSpaces.find((space) => space.id === activeCareSpaceId) : undefined),
        [activeCareSpaceId, careSpaces],
    );

    const addableDependentNames = useMemo(() => {
        const existingNames = new Set(
            (activeCareSpace?.dependents || []).map((dependent) => dependent.name.trim().toLowerCase()),
        );

        return dependents
            .map((dependent) => dependent.name.trim())
            .filter((name) => name.length > 0)
            .filter((name) => !existingNames.has(name.toLowerCase()));
    }, [dependents, activeCareSpace]);

    const handleAddDependentToCareSpace = (dependentName: string) => {
        const careSpaceId = activeCareSpaceId;

        if (!careSpaceId) {
            setIsAddDependentVisible(false);
            setActiveCareSpaceId(null);
            return;
        }

        addDependentToCareSpace(careSpaceId, dependentName);

        setIsAddDependentVisible(false);
        setActiveCareSpaceId(null);
    };

    StatusBar.setBarStyle("dark-content");

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={styles.headerTitle}>Care Spaces</Text>
                            <Text style={styles.subHeader}>Collaborate with family and caregivers</Text>
                        </View>
                    </View>

                    {/* This is for the buttons */}
                    <CareButtons onCreateCareSpace={createCareSpace} onJoinCareSpace={joinCareSpaceViaCode} />

                    {/* This section is for the care container */}
                    {careSpaces.map((careSpace) => (
                        <CareContainerCard
                            key={careSpace.id}
                            title={careSpace.title}
                            description={careSpace.description}
                            currentUserRole={careSpace.currentUserRole}
                            familyMembers={careSpace.familyMembers}
                            caregivers={careSpace.caregivers}
                            dependents={careSpace.dependents}
                            onPress={() =>
                                router.push({
                                    pathname: "/careSpaceSettings",
                                    params: {
                                        id: careSpace.id,
                                        title: careSpace.title,
                                        description: careSpace.description,
                                        familyMembers: JSON.stringify(careSpace.familyMembers),
                                        caregivers: JSON.stringify(careSpace.caregivers),
                                        dependents: JSON.stringify(careSpace.dependents.map((dependent) => dependent.name)),
                                        tasks: JSON.stringify(careSpace.tasks),
                                    },
                                })
                            }
                            onAddDependent={() => {
                                setActiveCareSpaceId(careSpace.id);
                                setIsAddDependentVisible(true);
                            }}
                        />
                    ))}

                    <AddDependentModal
                        visible={isAddDependentVisible}
                        onClose={() => {
                            setIsAddDependentVisible(false);
                            setActiveCareSpaceId(null);
                        }}
                        dependents={addableDependentNames}
                        onAddDependent={handleAddDependentToCareSpace}
                    />

                    <AddCaregiverModal
                        visible={isAddCaregiverVisible}
                        code="AFTUPD"
                        onClose={() => setIsAddCaregiverVisible(false)}
                        onAddCaregiver={() => setIsAddCaregiverVisible(false)}
                    />
                </View>
            </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

