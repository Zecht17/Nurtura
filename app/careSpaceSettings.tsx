import EditableTaskCard from "@/components/cards/editableTaskCard";
import EditorRoleCard from "@/components/cards/editorRoleCard";
import OwnerRoleCard from "@/components/cards/ownerRoleCard";
import ViewerRoleCard from "@/components/cards/viewerRoleCard";
import AddDependentModal from "@/components/modals/addDependentModal";
import DeleteCareSpaceModal from "@/components/modals/deleteCareSpaceModal";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import GenerateCsCodeModal from "@/components/modals/generateCsCode";
import ManageAccessModal from "@/components/modals/manageAccessModal";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import { useCareSpaces } from "@/context/CareSpacesContext";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type RoleLabel = "Owner" | "Editor" | "Viewer";

type PersonWithRole = {
    initial: string;
    name: string;
    role: RoleLabel;
    note?: string;
};

type CareSpaceTask = {
    id: string;
    title: string;
    dependent: string;
    description: string;
    status: "pending" | "completed" | "missing";
    dueDate?: string;
    dueTime?: string;
    priority?: string;
    recurringPattern?: string | null;
};

const getParamValue = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
};

const parseDependentNames = (value?: string | string[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return ["Emma Johnson"];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return ["Emma Johnson"];
        }

        const normalized = parsed
            .filter((item): item is string => typeof item === "string")
            .map((name) => name.trim())
            .filter((name) => name.length > 0);

        return normalized;
    } catch {
        return ["Emma Johnson"];
    }
};

const parsePeopleWithRole = (value: string | string[] | undefined, fallback: PersonWithRole[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return fallback;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return fallback;
        }

        const normalized = parsed
            .filter((item): item is PersonWithRole => typeof item === "object" && item !== null)
            .map((item) => ({
                initial: typeof item.initial === "string" ? item.initial : getInitial(typeof item.name === "string" ? item.name : ""),
                name: typeof item.name === "string" ? item.name : "Unknown",
                role: item.role === "Owner" || item.role === "Editor" || item.role === "Viewer" ? item.role : "Viewer",
                note: typeof item.note === "string" ? item.note : undefined,
            }))
            .filter((item) => item.name.trim().length > 0);

        return normalized;
    } catch {
        return fallback;
    }
};

const parseCareTasks = (value?: string | string[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return [] as CareSpaceTask[];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [] as CareSpaceTask[];
        }

        return parsed
            .filter((item): item is CareSpaceTask => typeof item === "object" && item !== null)
            .map((item, index) => ({
                id: typeof item.id === "string" ? item.id : `task-${index}`,
                title: typeof item.title === "string" ? item.title : "Untitled Task",
                dependent: typeof item.dependent === "string" ? item.dependent : "Unknown",
                description: typeof item.description === "string" ? item.description : "",
                status: item.status === "pending" || item.status === "completed" || item.status === "missing" ? item.status : "pending",
                dueDate: typeof item.dueDate === "string" ? item.dueDate : undefined,
                dueTime: typeof item.dueTime === "string" ? item.dueTime : undefined,
                priority: typeof item.priority === "string" ? item.priority : undefined,
                recurringPattern: typeof item.recurringPattern === "string" || item.recurringPattern === null ? item.recurringPattern : undefined,
            }));
    } catch {
        return [] as CareSpaceTask[];
    }
};

const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
};

export default function CareSpaceSettings() {
    StatusBar.setBarStyle("dark-content");
    const params = useLocalSearchParams<{
        id?: string;
        title?: string;
        description?: string;
        familyMembers?: string;
        caregivers?: string;
        dependents?: string;
        tasks?: string;
    }>();

    const { careSpaces, updateCareSpaceInfo, addDependentToCareSpace, removeTaskFromCareSpace } = useCareSpaces();
    const careSpaceId = getParamValue(params.id);
    const selectedCareSpace = careSpaceId ? careSpaces.find((item) => item.id === careSpaceId) : undefined;

    const initialSpaceName = (selectedCareSpace?.title ?? getParamValue(params.title)?.trim()) || "Emma's Care";
    const initialDescription = (selectedCareSpace?.description ?? getParamValue(params.description)?.trim()) || "Case for Emma";
    const initialFamilyMembers = selectedCareSpace?.familyMembers ?? parsePeopleWithRole(params.familyMembers, [
        { initial: "J", name: "John Doe", role: "Owner" },
        { initial: "J", name: "Juztine Miguel", role: "Editor" },
    ]);
    const initialCaregivers = selectedCareSpace?.caregivers ?? parsePeopleWithRole(params.caregivers, [
        { initial: "J", name: "John Doe", role: "Owner" },
        { initial: "J", name: "Juztine Miguel", role: "Editor" },
    ]);
    const initialDependents = selectedCareSpace?.dependents.map((dependent) => dependent.name) ?? parseDependentNames(params.dependents);
    const initialCareSpaceTasks = selectedCareSpace?.tasks ?? parseCareTasks(params.tasks);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [spaceName, setSpaceName] = useState(initialSpaceName);
    const [description, setDescription] = useState(initialDescription);
    const [draftSpaceName, setDraftSpaceName] = useState(initialSpaceName);
    const [draftDescription, setDraftDescription] = useState(initialDescription);
    const [familyMembers, setFamilyMembers] = useState<PersonWithRole[]>(initialFamilyMembers);
    const [caregivers, setCaregivers] = useState<PersonWithRole[]>(initialCaregivers);
    const [dependentNames, setDependentNames] = useState<string[]>(initialDependents);
    const [careSpaceTasks, setCareSpaceTasks] = useState<CareSpaceTask[]>(initialCareSpaceTasks);
    const [showGenerateCodeModal, setShowGenerateCodeModal] = useState(false);
    const [showManageAccessModal, setShowManageAccessModal] = useState(false);
    const [showDeleteCareSpaceModal, setShowDeleteCareSpaceModal] = useState(false);
    const [showAddDependentModal, setShowAddDependentModal] = useState(false);
    const [manageAccessRole, setManageAccessRole] = useState<"Viewer" | "Editor">("Viewer");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    useEffect(() => {
        setSpaceName(initialSpaceName);
        setDescription(initialDescription);
        setDraftSpaceName(initialSpaceName);
        setDraftDescription(initialDescription);
        setFamilyMembers(initialFamilyMembers);
        setCaregivers(initialCaregivers);
        setDependentNames(initialDependents);
        setCareSpaceTasks(initialCareSpaceTasks);
        setPendingDeleteId(null);
    }, [
        initialSpaceName,
        initialDescription,
        selectedCareSpace,
        params.familyMembers,
        params.caregivers,
        params.dependents,
        params.tasks,
    ]);

    const handleInfoEdit = () => {
        setDraftSpaceName(spaceName);
        setDraftDescription(description);
        setIsEditingInfo(true);
    };

    const handleInfoSave = () => {
        // TODO: Persist `spaceName` and `description` to backend/context.
        const nextTitle = draftSpaceName.trim() || "Emma's Care";
        const nextDescription = draftDescription.trim() || "-";

        setSpaceName(nextTitle);
        setDescription(nextDescription);

        if (careSpaceId) {
            updateCareSpaceInfo(careSpaceId, { title: nextTitle, description: nextDescription });
        }

        setIsEditingInfo(false);
    };

    const handleInfoCancel = () => {
        setDraftSpaceName(spaceName);
        setDraftDescription(description);
        setIsEditingInfo(false);
    };

    const openManageAccess = (role: "Viewer" | "Editor") => {
        setManageAccessRole(role);
        setShowManageAccessModal(true);
    };

    const renderMemberCard = (member: PersonWithRole, keyPrefix: string) => {
        if (member.role === "Owner") {
            return (
                <OwnerRoleCard
                    key={`${keyPrefix}-${member.name}`}
                    name={member.name}
                    initial={member.initial}
                />
            );
        }

        if (member.role === "Editor") {
            return (
                <EditorRoleCard
                    key={`${keyPrefix}-${member.name}`}
                    name={member.name}
                    initial={member.initial}
                    onPress={() => openManageAccess("Editor")}
                />
            );
        }

        return (
            <ViewerRoleCard
                key={`${keyPrefix}-${member.name}`}
                name={member.name}
                initial={member.initial}
                onPress={() => openManageAccess("Viewer")}
            />
        );
    };

    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

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

    const decoratedTasks = careSpaceTasks.map((task) => {
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
            <ScrollView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <View>
                            {/* This is for the name of the Care Person */}
                            <Text style={styles.headerTitle}>{spaceName}</Text>
                            <Text style={styles.subHeader}>Care Space Settings</Text>
                        </View>
                    </View>

                    {/* This is the container for the Care Space Information */}
                    <View style={styles.careInfoContainer}>
                        <View style={styles.careInfoRow}>
                        <Text style={styles.careInfoTitle}>Care Space Information</Text>
                            {isEditingInfo ? (
                                <View style={styles.actionRow}>
                                    <Pressable style={[styles.editButton, styles.saveButton]} onPress={handleInfoSave}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </Pressable>
                                    <Pressable style={styles.editButton} onPress={handleInfoCancel}>
                                        <Text style={styles.editButtonText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={styles.actionRow}>
                                    <Pressable style={styles.editButton} onPress={handleInfoEdit}>
                                        <Feather name="edit" size={16} color="black" />
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </Pressable>
                                    <Pressable style={styles.editButton} onPress={() => setShowGenerateCodeModal(true)}>
                                        <FontAwesome6 name="add" size={14} color="black" />
                                        <Text style={styles.editButtonText}>Invite</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        {/* This is for the Care Space Details */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.csNameTitle}>Care Space Name:</Text>
                            <View style={styles.csNameContainer}>
                                {isEditingInfo ? (
                                    <TextInput
                                        value={draftSpaceName}
                                        onChangeText={setDraftSpaceName}
                                        style={styles.csInput}
                                        placeholder="Enter care space name"
                                        placeholderTextColor="#999"
                                    />
                                ) : (
                                    <Text style={styles.csName}>{spaceName}</Text>
                                )}
                            </View>
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.csDescriptionTitle}>Description:</Text>
                            <View style={styles.csNameContainer}>
                                {isEditingInfo ? (
                                    <TextInput
                                        value={draftDescription}
                                        onChangeText={setDraftDescription}
                                        style={[styles.csInput, styles.csDescriptionInput]}
                                        placeholder="Add a description"
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                ) : (
                                    <Text style={styles.csDescription}>{description}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* This is for the Family members card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialIcons name="people-alt" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Family Members</Text>
                                <Text style={styles.careInfoTitle}>({familyMembers.length})</Text>
                            </View>
                        </View>

                        {familyMembers.map((member) => renderMemberCard(member, "family"))}
                    </View>

                    {/* This is for the Caregiver card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialIcons name="people-alt" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Caregivers</Text>
                                <Text style={styles.careInfoTitle}>({caregivers.length})</Text>
                            </View>
                        </View>

                        {caregivers.map((caregiver) => renderMemberCard(caregiver, "caregiver"))}
                    </View>

                    {/* This is for the Dependent card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialCommunityIcons name="baby-face" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Dependents</Text>
                                <Text style={styles.careInfoTitle}>({dependentNames.length})</Text>
                            </View>
                        
                        <Pressable style={styles.editButton} onPress={() => setShowAddDependentModal(true)}>
                            <FontAwesome6 name="add" size={14} color="black" />
                            <Text style={styles.editButtonText}>Add Dependent</Text>
                        </Pressable>
                        </View>

                        {/* This is for the Dependent Details */}
                        {dependentNames.map((name) => (
                            <ViewerRoleCard
                                key={`dependent-${name}`}
                                name={name}
                                initial={getInitial(name)}
                                dependentStyle
                                onPress={() => openManageAccess("Viewer")}
                            />
                        ))}
                    </View>

                    {/* This is for the task */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialIcons name="task-alt" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Tasks</Text>
                                <Text style={styles.careInfoTitle}>({decoratedTasks.length})</Text>
                            </View>
                        
                        <Pressable style={styles.editButton}>
                            <FontAwesome6 name="add" size={14} color="black" />
                            <Text style={styles.editButtonText}>Add Task</Text>
                        </Pressable>
                        </View>
                        {/* This is for the task card */}
                        <ScrollView>
                            <View style={styles.taskContainer}>
                                {decoratedTasks.map((task) => (
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

                                <DeleteTaskModal
                                    visible={pendingDeleteId !== null}
                                    taskTitle={careSpaceTasks.find((taskItem) => taskItem.id === pendingDeleteId)?.title}
                                    onConfirm={() => {
                                        if (pendingDeleteId) {
                                            setCareSpaceTasks((prev) => prev.filter((taskItem) => taskItem.id !== pendingDeleteId));

                                            if (careSpaceId) {
                                                removeTaskFromCareSpace(careSpaceId, pendingDeleteId);
                                            }
                                        }
                                        setPendingDeleteId(null);
                                    }}
                                    onCancel={() => setPendingDeleteId(null)}
                                />
                            </View>
                        </ScrollView>

                    </View>

                    {/* This is for the Delete care space */}
                    <View style={styles.dangerContainer}>
						<Text style={styles.dangerTitle}>Delete Care Space</Text>
						<Text style={styles.dangerSubTitle}>Permanently remove this care space. This action cannot be undone.</Text>
                        <Pressable style={styles.dangerButton} onPress={() => setShowDeleteCareSpaceModal(true)}>
							<AntDesign name="exclamation-circle" size={16} color="#ffffff" />
							<Text style={styles.dangerButtonText}>Delete Care Space</Text>
                        </Pressable>
					</View>

                    <GenerateCsCodeModal
                        visible={showGenerateCodeModal}
                        initialCode="ABC-DEF"
                        initialRole="Viewer"
                        onClose={() => setShowGenerateCodeModal(false)}
                        onGenerate={() => setShowGenerateCodeModal(false)}
                    />

                    <ManageAccessModal
                        visible={showManageAccessModal}
                        initialRole={manageAccessRole}
                        onClose={() => setShowManageAccessModal(false)}
                        onGenerate={() => setShowManageAccessModal(false)}
                        onRemoveMember={() => setShowManageAccessModal(false)}
                    />

                    <AddDependentModal
                        visible={showAddDependentModal}
                        onClose={() => setShowAddDependentModal(false)}
                        onAddDependent={(name) => {
                            const trimmedName = name.trim();

                            if (trimmedName.length === 0) {
                                setShowAddDependentModal(false);
                                return;
                            }

                            setDependentNames((prev) => {
                                const alreadyExists = prev.some(
                                    (item) => item.toLowerCase() === trimmedName.toLowerCase(),
                                );

                                return alreadyExists ? prev : [...prev, trimmedName];
                            });

                            if (careSpaceId) {
                                addDependentToCareSpace(careSpaceId, trimmedName);
                            }

                            setShowAddDependentModal(false);
                        }}
                    />

                    <DeleteCareSpaceModal
                        visible={showDeleteCareSpaceModal}
                        careSpaceName={spaceName}
                        onCancel={() => setShowDeleteCareSpaceModal(false)}
                        onConfirm={() => {
                            setShowDeleteCareSpaceModal(false);
                            router.back();
                        }}
                    />

                </View>
            </SafeAreaView>
            </ScrollView>
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

    csName: {
        fontSize: 14,
        color: "#black",
    },

    csNameTitle: {
        fontSize: 16,
        color: "#black",
    },

    csNameContainer: {
        marginTop: 5,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: 10,
        borderRadius: 8,
    },

    csInput: {
        fontSize: 14,
        color: "#000",
        paddingVertical: 0,
    },

    csDescriptionInput: {
        minHeight: 68,
    },

    csDescriptionTitle: {
        fontSize: 16,
        color: "#black",
    },

    csDescription: {
        fontSize: 14,
        color: "#black",
        // marginTop: 5,
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

    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    saveButton: {
        backgroundColor: "#7C6FDC",
        borderColor: "#7C6FDC",
    },

    saveButtonText: {
        color: "#ffffff",
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
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },

    // Dependent Card Styles
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

    dependentEmail: {
        fontSize: 14,
        color: "#777",
    },

    dependentDetailsRow: {
        flexDirection: "column",
        gap: 4,
    },

    dangerContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
		marginTop: 20,
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ff4d4d",
		borderRadius: 12,
	},

	dangerTitle: {
		fontSize: 18,
		fontWeight: "500",
        marginTop: 5,
		marginBottom: 10,
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
});