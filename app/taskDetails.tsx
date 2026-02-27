import EditTaskButton from "@/components/buttons/editTaskButton";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import { useTasks } from "@/context/TasksContext";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TaskDetails() {
    const { tasks, removeTask } = useTasks();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const task = useMemo(() => {
        if (!tasks || tasks.length === 0) return undefined;
        if (id) return tasks.find((t) => t.id === id) ?? tasks[0];
        return tasks[0];
    }, [tasks, id]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const priorityTagByLevel = {
        High: <HighPriorityStatus />,
        Medium: <MediumPriorityStatus />,
        Low: <LowPriorityStatus />,
    } as const;

    const formatDateTime = (dueDate?: string, dueTime?: string) => {
        if (!dueDate && !dueTime) return "";
        const combined = [dueDate, dueTime].filter(Boolean).join(" ");
        const parsed = combined ? new Date(combined) : undefined;
        if (parsed && !Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                weekday: "long",
                hour: "numeric",
                minute: "2-digit",
            });
        }
        return combined;
    };

    if (!task) {
        return null; // Screen is only shown when a task exists
    }

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <SafeAreaView style={styles.container}>
                    {/* This is the header */}
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.headerTitle}>Task Details</Text>
                            <Text style={styles.subHeader}>View and manage this task</Text>
                        </View>
                        <EditTaskButton onPress={() => router.push({ pathname: "/editTaskPage", params: { id: task.id } })} />
                    </View>

                    {/* This is for the card that contains the title of the task, category, and status */}
                    <View style={styles.cardPrimary}>
                        <View style={styles.titleRow}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                        </View>
                        <View style={styles.pillRow}> 
                            {task.category ? (
                                <View style={[styles.pill, styles.neutralPill]}>
                                    <Text style={styles.pillText}>{task.category}</Text>
                                </View>
                            ) : null}
                            {task.priority && priorityTagByLevel[task.priority as keyof typeof priorityTagByLevel]}
                        </View>
                    </View>
                    
                    {/* This is for the general task information */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Task Information</Text>

                        <View style={styles.infoBlock}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={24} color="#6A5ACD" />
                                <View style={styles.infoTextGroup}>
                                    <Text style={styles.infoLabel}>Dependent</Text>
                                    <Text style={styles.infoValue}>{task.dependent}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoBlock}>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={24} color="#6A5ACD" />
                                <View style={styles.infoTextGroup}>
                                    <Text style={styles.infoLabel}>Due Date & Time</Text>
                                    <Text style={styles.infoValue}>{formatDateTime(task.dueDate, task.dueTime) || "Not set"}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Description</Text>
                            <Text style={styles.infoValue}>{task.description || "No description provided."}</Text>
                        </View>

                        {task.recurringPattern ? (
                            <View style={[styles.infoBlock, styles.highlightBlock]}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="repeat-outline" size={24} color="#6A5ACD" />
                                    <View style={styles.infoTextGroup}>
                                        <Text style={styles.infoValue}>Recurring Task</Text>
                                        <Text style={styles.infoLabel}>Repeats: {task.recurringPattern.toLowerCase()}</Text>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        <View style={[styles.infoBlock, styles.reminderBlock]}>
                            <View style={styles.infoRow}>
                                <Ionicons name="alarm-outline" size={24} color="#4B75F8" />
                                <View style={styles.infoTextGroup}>
                                    <Text style={styles.infoValue}>Reminder</Text>
                                    <Text style={styles.infoLabel}>
                                        {task.reminderEnabled ? "15 minutes before" : "No reminder set"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.dangerCard}>
                        <Text style={styles.dangerTitle}>Delete Task</Text>
                        <Text style={styles.dangerCopy}>Permanently remove this task. This action cannot be undone.</Text>
                        <Pressable style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
                            <AntDesign name="delete" size={16} color="#ffffff" />
                            <Text style={styles.deleteButtonText}>Delete Task</Text>
                        </Pressable>
                    </View>
                    <DeleteTaskModal
                        visible={showDeleteModal}
                        taskTitle={task.title}
                        onConfirm={() => {
                            removeTask(task.id);
                            setShowDeleteModal(false);
                            router.back();
                        }}
                        onCancel={() => setShowDeleteModal(false)}
                    />
                </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingBottom: 16,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        gap: 16,
    },
    headerContainer: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 4,
    },
    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 2,
    },
    cardPrimary: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    radioWrapper: {
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    radioPressed: {
        opacity: 0.85,
    },
    customRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#cccc",
        justifyContent: "center",
        alignItems: "center",
    },
    customRadioSelected: {
        backgroundColor: "#7C6FDC",
    },
    customRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ffffff",
    },
    taskTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#111",
    },
    pillRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    neutralPill: {
        backgroundColor: "#fde8e8",
    },
    priorityPill: {
        backgroundColor: "#f9d9e1",
    },
    pillText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8a1c32",
    },
    statusRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    sectionCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111",
    },
    infoBlock: {
        backgroundColor: "#f7f8fb",
        borderRadius: 12,
        padding: 12,
        gap: 6,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    infoTextGroup: {
        flexDirection: "column",
        gap: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
    },
    highlightBlock: {
        backgroundColor: "#f7eefe",
    },
    reminderBlock: {
        backgroundColor: "#e7f0ff",
    },
    datePill: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    datePillText: {
        color: "#000000",
        fontSize: 14,
    },
    dangerCard: {
        backgroundColor: "#fff6f6",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: "#f5c2c2",
        marginBottom: 16,
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#b01e1e",
    },
    dangerCopy: {
        fontSize: 13,
        color: "#b01e1e",
    },
    deleteButton: {
        marginTop: 4,
        backgroundColor: "#e43e3e",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    deleteButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    emptyCard: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 16,
        marginTop: 12,
    },
    emptyText: {
        color: "#444",
        fontSize: 14,
    },
});