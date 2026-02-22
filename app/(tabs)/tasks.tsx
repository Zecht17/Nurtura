import AddTaskButton from "@/components/buttons/addTask";
import EditableTaskCard from "@/components/cards/editableTaskCard";
import DateStatus from "@/components/tags/date/dateStatus";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import HighPriorityStatus from "@/components/tags/urgency/highPriority";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, TextInput as RNTextInput, ScrollView, StyleSheet, Text, UIManager, View } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function TaskScreen() {
    const [range, setRange] = useState("All Dependents");
    const [range2, setRange2] = useState("All Categories");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
            
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={styles.headerTitle}>Tasks</Text>
                            <Text style={styles.subHeader}>Manage caregiving activities</Text>
                        </View>
                        <AddTaskButton />
                    </View>
                    
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#999" />
                        <RNTextInput
                            style={styles.searchInput}
                            placeholder="Search tasks..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Dependents and categories dropdown */}
                    <View style={styles.sortingContainer}>
                        <Menu
                            visible={menuVisible1}
                            onDismiss={() => setMenuVisible1(false)}
                            anchor={
                            <Pressable onPress={() => setMenuVisible1(true)}>
                                <TextInput
                                value={range}
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                right={<TextInput.Icon icon="menu-down" />}
                                outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                                style={styles.inputField}
                                />
                            </Pressable>
                            }
                            contentStyle={styles.dropdownContent}
                            style={styles.dropdown}
                        >
                            <Menu.Item onPress={() => { setRange("dependent1"); setMenuVisible1(false); }} title="Jirah Denisse" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setRange("dependent2"); setMenuVisible1(false); }} title="Ralph Jayrell" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setRange("dependent3"); setMenuVisible1(false); }} title="Cyriel Alden" titleStyle={styles.dropdownItemText} />
                        </Menu>

                        {/* Drop down 2 */}
                        <Menu
                            visible={menuVisible2}
                            onDismiss={() => setMenuVisible2(false)}
                            anchor={
                            <Pressable onPress={() => setMenuVisible2(true)}>
                                <TextInput
                                value={range2}
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                right={<TextInput.Icon icon="menu-down" />}
                                outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                                style={styles.inputField}
                                />
                            </Pressable>
                            }
                            contentStyle={styles.dropdownContent}
                            style={styles.dropdown2}
                        >
                            <Menu.Item onPress={() => { setRange2("category1"); setMenuVisible2(false); }} title="Category 1" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setRange2("category2"); setMenuVisible2(false); }} title="Category 2" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setRange2("category3"); setMenuVisible2(false); }} title="Category 3" titleStyle={styles.dropdownItemText} />
                        </Menu>
                    </View>
                    
                    {/* This is the status button container (Pending, Completed, Missing) */}
                    <View style={styles.toDoListContainer}>
                        <View style={styles.toDoButtons}>
                            <Pressable 
                                style={[styles.pendingButton, selectedStatus === "pending" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("pending");
                                }}
                            >
                                <Feather name="clock" size={16} color={selectedStatus === "pending" ? "white" : "black"} />
                                <Text style={selectedStatus === "pending" && styles.activeButtonText}>Pending</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.completedButton, selectedStatus === "completed" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("completed");
                                }}
                            >
                                <Feather name="check-circle" size={16} color={selectedStatus === "completed" ? "white" : "black"} />
                                <Text style={selectedStatus === "completed" && styles.activeButtonText}>Completed</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.missingButton, selectedStatus === "missing" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("missing");
                                }}
                            >
                                <AntDesign name="exclamation-circle" size={16} color={selectedStatus === "missing" ? "white" : "black"} />
                                <Text style={selectedStatus === "missing" && styles.activeButtonText}>Missing</Text>
                            </Pressable>
                        </View>

                        {/* Task Cards Display */}
                        <View style={styles.taskCardsContainer}>
                            {selectedStatus === "pending" && (
                                <View>
                                    <EditableTaskCard
                                        value="morning-med"
                                        selectedTask={selectedTask}
                                        onSelect={setSelectedTask}
                                        title="Morning Medication"
                                        dependent="Jirah Denisse"
                                        description="Give multivitamin with breakfast"
                                        statusTags={
                                        <>
                                            <PendingStatus />
                                            <HighPriorityStatus />
                                            <DailyRecurringStatus />
                                        </>
                                        }
                                        dateTag={<DateStatus />}
                                    />
                                </View>
                            )}
                            {selectedStatus === "completed" && (
                                <View>
                                    <EditableTaskCard
                                        value="eat-lunch"
                                        selectedTask={selectedTask}
                                        onSelect={setSelectedTask}
                                        title="Eat Lunch"
                                        dependent="Jirah Denisse"
                                        description="Eat Lunch with Jirah at 12 PM"
                                        statusTags={
                                        <>
                                            <CompletedStatus />
                                            <HighPriorityStatus />
                                            <WeeklyRecurringStatus />
                                        </>
                                        }
                                        dateTag={<DateStatus />}
                                    />
                                </View>
                            )}
                            {selectedStatus === "missing" && (
                                <View>
                                    <EditableTaskCard
                                        value="take-out-trash"
                                        selectedTask={selectedTask}
                                        onSelect={setSelectedTask}
                                        title="Take Out Trash"
                                        dependent="Jirah Denisse"
                                        description="Take out the trash in the kitchen"
                                        statusTags={
                                        <>
                                            <MissedStatus />
                                            <HighPriorityStatus />
                                            <WeeklyRecurringStatus />
                                        </>
                                        }
                                        dateTag={<DateStatus />}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                    
                </ScrollView>
            
        </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    gradient: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },

    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        marginLeft: 10,
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginBottom: 10,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },

    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    // Dropdown styles
    inputField: {
        width: 185,
        height: 35,
        backgroundColor: "#ffffff",
    },

    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "48%",
        marginTop: 30,
        marginHorizontal: -10,
    },

    dropdown2: {
        padding: 12,
        borderRadius: 16,
        width: "48%",
        marginTop: 30,
        marginHorizontal: 11,
    },

    dropdownContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
    },

    dropdownItemText: {
        color: "#111827",
    },

    // Sorting
    sortingContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        padding: 20,
        paddingTop: 0,
        paddingBottom: 0,
    },

    // To-do list container
    toDoListContainer: {
        padding: 20,
    },

    toDoButtons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 100,
        padding: 8,
        // paddingTop: 0,
    },

    // Status filter buttons
    pendingButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
        width: "auto",
        gap: 8,
        padding: 10,
        borderRadius: 100,
    },

    completedButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
        width: "auto",
        gap: 8,
        padding: 10,
        borderRadius: 100,
    },

    missingButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
        width: "auto",
        gap: 8,
        padding: 10,
        borderRadius: 100,
    },

    activeButton: {
        opacity: 1,
        transform: [{ scale: 1.05 }],
        backgroundColor: "#7C6FDC",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    activeButtonText: {
        color: "#ffffff",
    },

    taskCardsContainer: {
        marginTop: 20,
    },

    statusText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
});