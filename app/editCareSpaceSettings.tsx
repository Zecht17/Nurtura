import EditableTaskCard from "@/components/cards/editableTaskCard";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import DateStatus from "@/components/tags/date/dateStatus";
import RecurringDayStatusTags, { getRecurringPatternBase } from "@/components/tags/date/recurringDayStatusTags";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import EditorBadge from "@/components/tags/roles/editor";
import OwnerBadge from "@/components/tags/roles/owner";
import ViewerBadge from "@/components/tags/roles/viewer";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import { useDependents } from "@/context/DependentContext";
import { useTasks } from "@/context/tasksContext";
import { useUser } from "@/context/UserContext";
import { resolveDependentDisplayName, selfDependentContextFromProfile } from "@/utils/resolveDependentDisplayName";
import { resolveTaskCareSpaceId } from "@/utils/resolveTaskCareSpaceId";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditCareSpaceSettings() {
    const [spaceName, setSpaceName] = useState("Emma's Care");
    const [description, setDescription] = useState("Case for Emma");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const { dependents } = useDependents();
    const { profileData } = useUser();
    const selfDependentResolution = useMemo(() => selfDependentContextFromProfile(profileData), [profileData]);
    const { tasks, deleteTaskApi } = useTasks();

    StatusBar.setBarStyle("dark-content");

    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const handleSave = () => {
        router.back();
    };

    const parseDueDateTime = (dueDate?: string, dueTime?: string) => {
        if (!dueDate) return null;
        const timePart = dueTime && dueTime.trim().length > 0 ? dueTime : "23:59";

        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const parsedIso = new Date(`${dueDate}T${timePart}`);
            if (!isNaN(parsedIso.getTime())) return parsedIso;
        }

        const nativeParsed = new Date(`${dueDate} ${timePart}`);
        if (!isNaN(nativeParsed.getTime())) return nativeParsed;

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

        const parsed = parseDueDateTime(dueDate, dueTime);
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
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Pressable onPress={() => router.back()}>
                                    <Feather name="arrow-left" size={24} color="black" />
                                </Pressable>
                                <View>
                                    <Text style={styles.headerTitle}>Edit Care Space</Text>
                                    <Text style={styles.subHeader}>Update care space details</Text>
                                </View>
                            </View>

                            <View style={styles.careInfoContainer}>
                                <View style={styles.careInfoRow}>
                                    <Text style={styles.careInfoTitle}>Care Space Information</Text>
                                    <View style={styles.actionRow}>
                                        <Pressable style={[styles.editButton, styles.ghostButton]} onPress={() => router.back()}>
                                            <Text style={styles.editButtonText}>Cancel</Text>
                                        </Pressable>
                                        <Pressable style={styles.saveButton} onPress={handleSave}>
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.csNameTitle}>Care Space Name:</Text>
                                    <TextInput
                                        value={spaceName}
                                        onChangeText={setSpaceName}
                                        style={styles.csNameInput}
                                        placeholder="Enter care space name"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.csDescriptionTitle}>Description:</Text>
                                    <TextInput
                                        value={description}
                                        onChangeText={setDescription}
                                        style={styles.csDescriptionInput}
                                        placeholder="Add a description"
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>

                            <View style={styles.caregiverInfoContainer}>
                                <View style={styles.caregiverInfoRow}>
                                    <View style={styles.caregiverTitle}>
                                        <MaterialIcons name="people-alt" size={18} color="#7C6FDC" />
                                        <Text style={styles.careInfoTitle}>Family Members</Text>
                                        <Text style={styles.careInfoTitle}>(2)</Text>
                                    </View>
                                </View>

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
                                        <EditorBadge />
                                    </View>
                                </View>
                            </View>

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
                                        <EditorBadge />
                                    </View>
                                </View>
                            </View>

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

                                <View style={styles.dependentDetails}>
                                    <View style={styles.caregiverInfoRow}>
                                        <View style={styles.caregiverTitle}>
                                            <View style={styles.dependentItem}><Text style={styles.dependentIcon}>E</Text></View>
                                            <Text style={styles.dependentName}>Emma Johnson</Text>
                                        </View>
                                        <ViewerBadge />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.caregiverInfoContainer}>
                                <View style={styles.caregiverInfoRow}>
                                    <View style={styles.caregiverTitle}>
                                        <MaterialIcons name="task-alt" size={18} color="#7C6FDC" />
                                        <Text style={styles.careInfoTitle}>Tasks</Text>
                                        <Text style={styles.careInfoTitle}>({tasks.length + 1})</Text>
                                    </View>

                                    <Pressable style={styles.editButton} onPress={() => router.push("/addTaskPage")}>
                                        <FontAwesome6 name="add" size={14} color="black" />
                                        <Text style={styles.editButtonText}>Add Task</Text>
                                    </Pressable>
                                </View>

                                <View style={styles.taskContainer}>
                                    <EditableTaskCard
                                        value="eat-lunch"
                                        selectedTask={selectedTask}
                                        onSelect={setSelectedTask}
                                        title="Eat Lunch"
                                        dependent="Jirah Denisse"
                                        description="Eat Lunch with Jirah at 12 PM"
                                        statusTags={
                                            <>
                                                <PendingStatus />
                                                <HighPriorityStatus />
                                                <WeeklyRecurringStatus />
                                            </>
                                        }
                                        dateTag={<DateStatus />}
                                    />

                                    {decoratedTasks.map((task) => (
                                        <EditableTaskCard
                                            key={task.id}
                                            value={task.id}
                                            selectedTask={selectedTask}
                                            onSelect={setSelectedTask}
                                            title={task.title}
                                            dependent={resolveDependentDisplayName(task, dependents, selfDependentResolution)}
                                            description={task.description}
                                            statusTags={
                                                <>
                                                    {statusTagByStatus[task.computedStatus as keyof typeof statusTagByStatus]}
                                                    {task.priority && priorityTagByLevel[task.priority as keyof typeof priorityTagByLevel]}
                                                    {(() => {
                                                        const recurringBase = getRecurringPatternBase(task.recurringPattern);
                                                        return recurringBase ? recurringTagByPattern[recurringBase as keyof typeof recurringTagByPattern] : null;
                                                    })()}
                                                </>
                                            }
                                            dateTag={
                                                <>
                                                    <RecurringDayStatusTags recurringPattern={task.recurringPattern} />
                                                    {renderDateTag(task.dueDate, task.dueTime)}
                                                </>
                                            }
                                            onEdit={() =>
                                                router.push({
                                                    pathname: "/editTaskPage",
                                                    params: {
                                                        id: task.id,
                                                        careSpaceId: task.careSpaceId ? String(task.careSpaceId) : undefined,
                                                    },
                                                })
                                            }
                                            onPress={() =>
                                                router.push({
                                                    pathname: "/taskDetails",
                                                    params: {
                                                        id: task.id,
                                                        careSpaceId: task.careSpaceId ? String(task.careSpaceId) : undefined,
                                                    },
                                                })
                                            }
                                            onDelete={() => setPendingDeleteId(task.id)}
                                        />
                                    ))}

                                    <DeleteTaskModal
                                        visible={pendingDeleteId !== null}
                                        taskTitle={tasks.find((taskItem) => taskItem.id === pendingDeleteId)?.title}
                                        onConfirm={async () => {
                                            if (!pendingDeleteId) {
                                                setPendingDeleteId(null);
                                                return;
                                            }

                                            const taskToDelete = tasks.find((taskItem) => taskItem.id === pendingDeleteId);
                                            const numericTaskId = Number.parseInt(pendingDeleteId, 10);
                                            const numericCareSpaceId = resolveTaskCareSpaceId(taskToDelete);

                                            if (!Number.isInteger(numericTaskId) || numericTaskId <= 0) {
                                                Alert.alert("Delete failed", "Unable to resolve task ID.");
                                                return;
                                            }

                                            if (numericCareSpaceId === undefined) {
                                                Alert.alert("Delete failed", "Unable to resolve care space ID for this task.");
                                                return;
                                            }

                                            try {
                                                await deleteTaskApi(numericTaskId, numericCareSpaceId);
                                                setPendingDeleteId(null);
                                            } catch (error) {
                                                Alert.alert("Delete failed", error instanceof Error ? error.message : "Unable to delete task.");
                                            }
                                        }}
                                        onCancel={() => setPendingDeleteId(null)}
                                    />
                                </View>
                            </View>

                            <View style={styles.dangerContainer}>
                                <Text style={styles.dangerTitle}>Danger Zone</Text>
                                <Text style={styles.dangerSubTitle}>Irreversible care space actions</Text>
                                <View style={styles.dangerButton}>
                                    <AntDesign name="exclamation-circle" size={16} color="#ffffff" />
                                    <Text style={styles.dangerButtonText}>Delete Care Space</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        flexDirection: "row",
        gap: 12,
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
    csNameTitle: {
        fontSize: 16,
        color: "black",
    },
    csDescriptionTitle: {
        fontSize: 16,
        color: "black",
    },
    csNameInput: {
        marginTop: 5,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: 10,
        borderRadius: 8,
        fontSize: 14,
        color: "#000",
    },
    csDescriptionInput: {
        marginTop: 5,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: 10,
        borderRadius: 8,
        fontSize: 14,
        color: "#000",
        minHeight: 96,
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
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    ghostButton: {
        backgroundColor: "#ffffff",
        borderColor: "#5e5e5e73",
        borderWidth: 1,
    },
    saveButton: {
        backgroundColor: "#7C6FDC",
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    editButtonText: {
        color: "#333",
        fontSize: 14,
    },
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
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
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
    caregiverDetails: {
        marginTop: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    dependentDetails: {
        marginTop: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    dependentItem: {
        backgroundColor: "#9B6CF0",
        width: 40,
        height: 40,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
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
    taskContainer: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 14,
        marginTop: 20,
    },
    datePill: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    datePillText: {
        color: "#000000",
        fontSize: 14,
    },
    dangerContainer: {
        marginTop: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ff4d4d",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    dangerTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginTop: 5,
        marginBottom: 4,
    },
    dangerSubTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    dangerButton: {
        backgroundColor: "#ff4d4d",
        gap: 10,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 5,
    },
    dangerButtonText: {
        color: "#ffffff",
        fontWeight: "500",
        fontSize: 15,
    },
});
