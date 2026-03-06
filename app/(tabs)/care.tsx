import CareButtons from "@/components/buttons/careSpaceButtons";
import { styles } from "@/components/styles/care-css";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CareScreen() {
    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={styles.headerTitle}>Care Spaces</Text>
                            <Text style={styles.subHeader}>Collaborate with family and caregivers</Text>
                        </View>
                    </View>

                    {/* This is for the buttons */}
                    <CareButtons />

                    {/* This section is for the care container */}
                    <Pressable style={styles.careContainer} onPress={() => router.push("/careSpaceSettings")}> 
                        <Text style={styles.careTitle}>Emma's Care</Text>
                        <Text style={styles.careDescription}>Emma Care</Text>

                        <View style={styles.caregiverRow}>
                            <Text style={styles.careSubTitle}>Caregivers</Text>
                            <View style={styles.addCaregiverButton}>
                                <FontAwesome6 name="add" size={15} color="black" />
                                <Text style={styles.addCaregiverText}>Add Caregiver</Text>
                            </View>
                        </View>

                        {/* Caregiver List */}
                        <View style={styles.caregiverList}>
                            <View style={styles.caregiverNameRow}>
                                <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>J</Text></View>
                                <Text style={styles.caregiverName}>John Doe</Text>
                            </View>

                            <View style={styles.caregiverNameRow}>
                                <View style={styles.caregiverItem}><Text style={styles.careGiverIcon}>R</Text></View>
                                <View style={{flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start"}}>
                                    <Text style={styles.caregiverName}>Ralph Jayrell</Text>
                                    <Text style={styles.backupText}>Backup</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dependent List */}
                        <View style={styles.caregiverRow}>
                            <Text style={styles.careSubTitle}>Carespace Dependent</Text>
                            <View style={styles.addCaregiverButton}>
                                <FontAwesome6 name="add" size={15} color="black" />
                                <Text style={styles.addCaregiverText}>Add Dependent</Text>
                            </View>
                        </View>

                        <View style={styles.dependentList}>
                            <View style={styles.caregiverNameRow}>
                                <View style={styles.dependentItem}><Text style={styles.careGiverIcon}>J</Text></View>
                                <Text style={styles.dependentName}>John Doe</Text>
                            </View>

                            <View style={styles.dependentNameRow}>
                                <View style={styles.dependentItem}><Text style={styles.dependentIcon}>R</Text></View>
                                <View style={{flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start"}}>
                                    <Text style={styles.dependentName}>Ralph Jayrell</Text>
                                    <Text style={styles.backupText}>Backup</Text>
                                </View>
                            </View>
                        </View>
                    </Pressable>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

