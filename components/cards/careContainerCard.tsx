import { styles } from "@/components/styles/care-css";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, Text, View } from "react-native";

type RoleLabel = "Owner" | "Editor" | "Viewer";

type PersonWithRole = {
    initial: string;
    name: string;
    role: RoleLabel;
    note?: string;
};

type DependentPerson = {
    initial: string;
    name: string;
};

type CareContainerCardProps = {
    title: string;
    description: string;
    familyMembers: PersonWithRole[];
    caregivers: PersonWithRole[];
    dependents: DependentPerson[];
    onPress: () => void;
    onAddDependent?: () => void;
};

export default function CareContainerCard({
    title,
    description,
    familyMembers,
    caregivers,
    dependents,
    onPress,
    onAddDependent,
}: CareContainerCardProps) {
    return (
        <Pressable style={styles.careContainer} onPress={onPress}>
            <Text style={styles.careTitle}>{title}</Text>
            <Text style={styles.careDescription}>{description}</Text>

            <View style={styles.caregiverRow}>
                <Text style={styles.familySubTitle}>Family Members ({familyMembers.length})</Text>
            </View>

            <View style={styles.familyList}>
                {familyMembers.map((member) => (
                    <View key={`family-${member.name}`} style={styles.caregiverNameRow}>
                        <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>{member.initial}</Text></View>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <View style={styles.caregiverNameRow}>
                                <Text style={styles.caregiverName}>{member.name}</Text>
                                <Text style={styles.caregiverName}>({member.role})</Text>
                            </View>
                            {member.note ? <Text style={styles.backupText}>{member.note}</Text> : null}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.caregiverRow}>
                <Text style={styles.careSubTitle}>Caregivers ({caregivers.length})</Text>
            </View>

            <View style={styles.caregiverList}>
                {caregivers.map((caregiver) => (
                    <View key={`caregiver-${caregiver.name}`} style={styles.caregiverNameRow}>
                        <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>{caregiver.initial}</Text></View>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <View style={styles.caregiverNameRow}>
                                <Text style={styles.caregiverName}>{caregiver.name}</Text>
                                <Text style={styles.caregiverName}>({caregiver.role})</Text>
                            </View>
                            {caregiver.note ? <Text style={styles.backupText}>{caregiver.note}</Text> : null}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.caregiverRow}>
                <Text style={styles.careSubTitle}>Dependents ({dependents.length})</Text>
                <Pressable
                    style={styles.addCaregiverButton}
                    onPress={(event) => {
                        event.stopPropagation();
                        onAddDependent?.();
                    }}
                >
                    <FontAwesome6 name="add" size={15} color="black" />
                    <Text style={styles.addCaregiverText}>Add Dependents</Text>
                </Pressable>
            </View>

            <View style={styles.memberList}>
                {dependents.map((dependent) => (
                    <View key={`dependent-${dependent.name}`} style={styles.memberNameRow}>
                        <View style={styles.memberItem}><Text style={styles.memberIcon}>{dependent.initial}</Text></View>
                        <Text style={styles.memberName}>{dependent.name}</Text>
                    </View>
                ))}
            </View>
        </Pressable>
    );
}