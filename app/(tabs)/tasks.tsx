import AddTaskButton from "@/components/buttons/addTask";
import EditableTaskCard from "@/components/cards/editableTaskCard";
import NoPendingTask from "@/components/cards/noPendingTask";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import DateStatus from "@/components/tags/date/dateStatus";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import { useTasks } from "@/context/TasksContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, LayoutAnimation, Platform, Pressable, TextInput as RNTextInput, ScrollView, StatusBar, StyleSheet, Text, UIManager, View } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TaskScreen() {
    const router = useRouter();
    // For the dropdowns
    const [range, setRange] = useState("All Dependents");
    const [range2, setRange2] = useState("All Categories");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    // For the task card when created
    const { tasks, removeTask } = useTasks();
    // For the date and time
    const [nowMs, setNowMs] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    // For the task card shows all the status, priority, and recurring pattern of the task
    const parseDueDateTime = (dueDate?: string, dueTime?: string) => {
        if (!dueDate) return null;
        const timePart = dueTime && dueTime.trim().length > 0 ? dueTime : "23:59";

        // Try ISO first (yyyy-mm-dd)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const parsedIso = new Date(`${dueDate}T${timePart}`);
            if (!isNaN(parsedIso.getTime())) return parsedIso;
        }

        // Try JS native parse
        const nativeParsed = new Date(`${dueDate} ${timePart}`);
        if (!isNaN(nativeParsed.getTime())) return nativeParsed;

        // Fallback: parse common locale format mm/dd/yyyy
        const parts = dueDate.split(/[\/]/).map((p) => parseInt(p, 10));
        if (parts.length === 3) {
            const [month, day, year] = parts;
            if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
                const [hours, minutes] = timePart
                    .replace(/\s?(AM|PM)$/i, "")
                    .split(":")
                    .map((p) => parseInt(p, 10));
                const hasPM = /PM$/i.test(timePart);
                const normalizedHours = Number.isNaN(hours)
                    ? 23
                    : Math.min(23, hasPM && hours < 12 ? hours + 12 : hours);
                const normalizedMinutes = Number.isNaN(minutes) ? 59 : Math.min(59, minutes);
                const manual = new Date(year, month - 1, day, normalizedHours, normalizedMinutes);
                if (!isNaN(manual.getTime())) return manual;
            }
        }

        return null;
    };

    const computeComputedStatus = (taskStatus: string, due: Date | null) => {
        if (taskStatus === "pending" && due && due.getTime() < nowMs) {
            return "missing" as const;
        }
        return taskStatus as "pending" | "completed" | "missing";
    };

    const decoratedTasks = tasks.map((task) => {
        const due = parseDueDateTime(task.dueDate, task.dueTime);
        const computedStatus = computeComputedStatus(task.status, due);
        return { ...task, computedStatus };
    });

    StatusBar.setBarStyle("dark-content");

    const filteredTasks = decoratedTasks.filter((task) => task.computedStatus === selectedStatus);

    const statusTagByStatus = {
        pending: <PendingStatus />,
        completed: <CompletedStatus />,
        missing: <MissedStatus />,
    } as const;

    const recurringTagByPattern = {
        Daily: <DailyRecurringStatus />,
        Weekly: <WeeklyRecurringStatus />,
        Monthly: <MonthlyRecurringStatus />,
    } as const;

    const priorityTagByLevel = {
        High: <HighPriorityStatus />,
        Medium: <MediumPriorityStatus />,
        Low: <LowPriorityStatus />,
    } as const;

    const renderDateTag = (dueDate?: string, dueTime?: string) => {
        if (!dueDate && !dueTime) return null;

        const formatDateTime = () => {
            if (!dueDate) return null;
            const timePart = dueTime?.trim() || "00:00";

            // Try ISO first
            if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
                const iso = new Date(`${dueDate}T${timePart}`);
                if (!isNaN(iso.getTime())) return iso;
            }

            // Try native parse
            const nativeParsed = new Date(`${dueDate} ${timePart}`);
            if (!isNaN(nativeParsed.getTime())) return nativeParsed;

            // Fallback: mm/dd/yyyy
            const parts = dueDate.split(/[\/]/).map((p) => parseInt(p, 10));
            if (parts.length === 3) {
                const [month, day, year] = parts;
                if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
                    const parsed = new Date(year, month - 1, day);
                    if (!isNaN(parsed.getTime())) {
                        const [h, m] = timePart.replace(/\s?(AM|PM)$/i, "").split(":").map((p) => parseInt(p, 10));
                        const hasPM = /PM$/i.test(timePart);
                        const hours = Number.isNaN(h) ? 0 : Math.min(23, hasPM && h < 12 ? h + 12 : h);
                        const minutes = Number.isNaN(m) ? 0 : Math.min(59, m);
                        parsed.setHours(hours, minutes, 0, 0);
                        return parsed;
                    }
                }
            }

        return null;
        };

        const parsed = formatDateTime();
        const label = parsed
            ? (() => {
                const datePart = parsed.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
                const weekday = parsed.toLocaleDateString(undefined, { weekday: "long" });
                const time = parsed.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
                return `${datePart} ${weekday} at ${time}`;
            })()
            : [dueDate, dueTime].filter(Boolean).join(" ");

        return (
            <View style={styles.datePill}>
                <Text style={styles.datePillText}>{label}</Text>
            </View>
        );
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>
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
                            {selectedStatus === "pending" && filteredTasks.length === 0 && (
                                <NoPendingTask />
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
                            {/* This is for the insert function, this will display the created task */}
                            {filteredTasks.map((task) => (
                                <EditableTaskCard
                                    key={task.id}
                                    value={task.id}
                                    selectedTask={selectedTask}
                                    onSelect={setSelectedTask}
                                    title={task.title}
                                    dependent={task.dependent}
                                    description={task.description}
                                    statusTags={
                                        <>
                                            {statusTagByStatus[task.computedStatus as keyof typeof statusTagByStatus]}
                                            {task.priority && priorityTagByLevel[task.priority as keyof typeof priorityTagByLevel]}
                                            {task.recurringPattern && recurringTagByPattern[task.recurringPattern as keyof typeof recurringTagByPattern]}
                                        </>
                                    }
                                    dateTag={renderDateTag(task.dueDate, task.dueTime)}
                                    onEdit={() => router.push({ pathname: "/editTaskPage", params: { id: task.id } })}
                                    onPress={() => router.push({ pathname: "/taskDetails", params: { id: task.id } })}
                                    onDelete={() => setPendingDeleteId(task.id)}
                                />
                            ))}
                        </View>

                        <DeleteTaskModal
                            visible={pendingDeleteId !== null}
                            taskTitle={tasks.find((t) => t.id === pendingDeleteId)?.title}
                            onConfirm={() => {
                                if (pendingDeleteId) {
                                    removeTask(pendingDeleteId);
                                }
                                setPendingDeleteId(null);
                            }}
                            onCancel={() => setPendingDeleteId(null)}
                        />

                    </View>
            </SafeAreaView>
        </ScrollView>
        </KeyboardAvoidingView>
        </LinearGradient>
    );
}

export const styles = StyleSheet.create({
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

    // Search bar styles
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

    searchInput: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 8,
        color: "#000000",
    },

    datePill: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        // marginTop: 6,
    },

    datePillText: {
        color: "#000000",
        fontSize: 14,
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
        gap: 12,
    },

    statusText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },

    viewTaskDetailsContainer: {
        marginTop: 20,
        alignItems: "center",
    },

    viewTaskDetailsText: {
        fontSize: 16,
        color: "#7C6FDC",
        fontWeight: "bold",
    },
});