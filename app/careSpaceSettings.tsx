import EditableTaskCard from "@/components/cards/editableTaskCard";
import EditorRoleCard from "@/components/cards/editorRoleCard";
import NoPendingTask from "@/components/cards/noPendingTask";
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
import { useDependents } from "@/context/DependentContext";
import { useTasks } from "@/context/tasksContext";
import { useUser } from "@/context/UserContext";
import { resolveDependentDisplayName, selfDependentContextFromProfile } from "@/utils/resolveDependentDisplayName";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CareSpaceTask,
    PersonWithRole,
    getInitial,
    getParamValue,
    parseCareTasks,
    parseDependentNames,
    parsePeopleWithRole,
} from "@/utils/careSpaceSettings.utils";

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

    const {
        careSpaces,
        updateCareSpace,
        deleteCareSpace,
        addMembersToCareSpaceBulk,
        updateCareSpaceMember,
        removeCareSpaceMember,
        updateCareSpaceInfo,
        addDependentToCareSpace,
        removeTaskFromCareSpace,
        generateJoinCode,
    } = useCareSpaces();
    const { dependents } = useDependents();
    const { profileData } = useUser();
    const selfDependentResolution = useMemo(() => selfDependentContextFromProfile(profileData), [profileData]);
    const { deleteTaskApi } = useTasks();
    const careSpaceId = getParamValue(params.id);
    const selectedCareSpace = careSpaceId ? careSpaces.find((item) => item.id === careSpaceId) : undefined;
    const currentUserRole = selectedCareSpace?.currentUserRole;
    const canEditCareSpaceInfo = currentUserRole === "Owner";
    const canDeleteCareSpace = currentUserRole === "Owner";
    const canAddMembers = currentUserRole === "Owner";

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
    const [selectedManagedMember, setSelectedManagedMember] = useState<PersonWithRole | null>(null);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState("");

    const addableDependentNames = dependents
        .map((dependent) => dependent.name.trim())
        .filter((name) => name.length > 0)
        .filter((name) => !dependentNames.some((existing) => existing.toLowerCase() === name.toLowerCase()));

    const resolveCareSpaceNumericId = () => {
        const source = (careSpaceId || selectedCareSpace?.id || "").replace("care-space-", "");
        const parsed = Number.parseInt(source, 10);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    };

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
        setSelectedManagedMember(null);
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
        if (!canEditCareSpaceInfo) {
            return;
        }

        setDraftSpaceName(spaceName);
        setDraftDescription(description);
        setIsEditingInfo(true);
    };

    const handleInfoSave = async () => {
        const nextTitle = draftSpaceName.trim() || "Emma's Care";
        const nextDescription = draftDescription.trim() || "-";

        try {
            const numericCareSpaceId = resolveCareSpaceNumericId();

            if (numericCareSpaceId) {
                await updateCareSpace(numericCareSpaceId, {
                    name: nextTitle,
                    description: nextDescription,
                });
            }

            setSpaceName(nextTitle);
            setDescription(nextDescription);

            if (careSpaceId) {
                updateCareSpaceInfo(careSpaceId, { title: nextTitle, description: nextDescription });
            }

            setIsEditingInfo(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update care space.";
            Alert.alert("Update Failed", message);
        }
    };

    const handleInfoCancel = () => {
        setDraftSpaceName(spaceName);
        setDraftDescription(description);
        setIsEditingInfo(false);
    };

    const openManageAccess = (member: PersonWithRole) => {
        if (!canAddMembers || member.role === "Owner") {
            return;
        }

        setSelectedManagedMember(member);
        setManageAccessRole(member.role === "Editor" ? "Editor" : "Viewer");
        setShowManageAccessModal(true);
    };

    const renderMemberCard = (member: PersonWithRole, keyPrefix: string, index: number) => {
        const memberKey = `${keyPrefix}-${member.memberId ?? `i-${index}`}`;
        if (member.role === "Owner") {
            return (
                <OwnerRoleCard
                    key={memberKey}
                    name={member.name}
                    initial={member.initial}
                />
            );
        }

        if (member.role === "Editor") {
            return (
                <EditorRoleCard
                    key={memberKey}
                    name={member.name}
                    initial={member.initial}
                    onPress={() => openManageAccess(member)}
                />
            );
        }

        return (
            <ViewerRoleCard
                key={memberKey}
                name={member.name}
                initial={member.initial}
                onPress={() => openManageAccess(member)}
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
                            {isEditingInfo && canEditCareSpaceInfo ? (
                                <View style={styles.actionRow}>
                                    <Pressable style={[styles.editButton, styles.saveButton]} onPress={handleInfoSave}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </Pressable>
                                    <Pressable style={styles.editButton} onPress={handleInfoCancel}>
                                        <Text style={styles.editButtonText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            ) : canEditCareSpaceInfo ? (
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
                            ) : null}
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

                        {familyMembers.map((member, index) => renderMemberCard(member, "family", index))}
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

                        {caregivers.map((caregiver, index) => renderMemberCard(caregiver, "caregiver", index))}
                    </View>

                    {/* This is for the Dependent card container */}
                    <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverInfoRow}>
                            <View style={styles.caregiverTitle}>
                                <MaterialCommunityIcons name="baby-face" size={18} color="#7C6FDC" />
                                <Text style={styles.careInfoTitle}>Dependents</Text>
                                <Text style={styles.careInfoTitle}>({dependentNames.length})</Text>
                            </View>
                        
                        {canAddMembers ? (
                            <Pressable style={styles.editButton} onPress={() => setShowAddDependentModal(true)}>
                                <FontAwesome6 name="add" size={14} color="black" />
                                <Text style={styles.editButtonText}>Add Dependent</Text>
                            </Pressable>
                        ) : null}
                        </View>

                        {/* This is for the Dependent Details */}
                        {dependentNames.map((name, index) => (
                            <ViewerRoleCard
                                key={`dependent-${index}`}
                                name={name}
                                initial={getInitial(name)}
                                dependentStyle
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
                        {decoratedTasks.length === 0 ? (
                            <View style={styles.taskContainer}>
                                <NoPendingTask />
                            </View>
                        ) : (
                            <ScrollView>
                                <View style={styles.taskContainer}>
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
                                                {task.recurringPattern && recurringTagByPattern[task.recurringPattern as keyof typeof recurringTagByPattern]}
                                            </>
                                        }
                                        dateTag={renderDateTag(task.dueDate, task.dueTime)}
                                        onEdit={() =>
                                            router.push({
                                                pathname: "/editTaskPage",
                                                params: {
                                                    id: task.id,
                                                    careSpaceId: resolveCareSpaceNumericId() ? String(resolveCareSpaceNumericId()) : undefined,
                                                },
                                            })
                                        }
                                        onPress={() =>
                                            router.push({
                                                pathname: "/taskDetails",
                                                params: {
                                                    id: task.id,
                                                    careSpaceId: resolveCareSpaceNumericId() ? String(resolveCareSpaceNumericId()) : undefined,
                                                },
                                            })
                                        }
                                        onDelete={() => setPendingDeleteId(task.id)}
                                    />
                                ))}
                                </View>
                            </ScrollView>
                        )}

                        <DeleteTaskModal
                            visible={pendingDeleteId !== null}
                            taskTitle={careSpaceTasks.find((taskItem) => taskItem.id === pendingDeleteId)?.title}
                            onConfirm={async () => {
                                if (!pendingDeleteId) {
                                    setPendingDeleteId(null);
                                    return;
                                }

                                const numericTaskId = Number.parseInt(pendingDeleteId, 10);
                                const numericCareSpaceId = resolveCareSpaceNumericId();

                                if (!Number.isInteger(numericTaskId) || numericTaskId <= 0) {
                                    Alert.alert("Delete Failed", "Unable to resolve task ID.");
                                    return;
                                }

                                if (!numericCareSpaceId) {
                                    Alert.alert("Delete Failed", "Unable to resolve care space ID.");
                                    return;
                                }

                                try {
                                    await deleteTaskApi(numericTaskId, numericCareSpaceId);
                                    setCareSpaceTasks((prev) => prev.filter((taskItem) => taskItem.id !== pendingDeleteId));

                                    if (careSpaceId) {
                                        removeTaskFromCareSpace(careSpaceId, pendingDeleteId);
                                    }

                                    setPendingDeleteId(null);
                                } catch (error) {
                                    const message = error instanceof Error ? error.message : "Unable to delete task.";
                                    Alert.alert("Delete Failed", message);
                                }
                            }}
                            onCancel={() => setPendingDeleteId(null)}
                        />

                    </View>

                    {/* This is for the Delete care space */}
                    {canDeleteCareSpace ? (
                        <View style={styles.dangerContainer}>
                            <Text style={styles.dangerTitle}>Delete Care Space</Text>
                            <Text style={styles.dangerSubTitle}>Permanently remove this care space. This action cannot be undone.</Text>
                            <Pressable style={styles.dangerButton} onPress={() => setShowDeleteCareSpaceModal(true)}>
                                <AntDesign name="exclamation-circle" size={16} color="#ffffff" />
                                <Text style={styles.dangerButtonText}>Delete Care Space</Text>
                            </Pressable>
                        </View>
                    ) : null}

                    <GenerateCsCodeModal
                        visible={showGenerateCodeModal}
                        initialCode={inviteCode}
                        initialRole="Viewer"
                        onClose={() => setShowGenerateCodeModal(false)}
                        onGenerate={async ({ role }) => {
                            const numericCareSpaceId = resolveCareSpaceNumericId();

                            if (!numericCareSpaceId) {
                                throw new Error("Unable to resolve care space ID for invite code generation.");
                            }

                            const code = await generateJoinCode(numericCareSpaceId, role);
                            setInviteCode(code);
                            return code;
                        }}
                    />

                    <ManageAccessModal
                        visible={showManageAccessModal}
                        memberName={selectedManagedMember?.name}
                        initialRole={manageAccessRole}
                        onClose={() => {
                            setShowManageAccessModal(false);
                            setSelectedManagedMember(null);
                        }}
                        onSaveAccess={async ({ role }) => {
                            if (!canAddMembers) {
                                throw new Error("Only the owner can manage member access.");
                            }

                            const memberId = selectedManagedMember?.memberId;
                            if (!memberId) {
                                throw new Error("Unable to resolve member ID.");
                            }

                            await updateCareSpaceMember(memberId, {
                                role_in_space: role.toLowerCase() as "viewer" | "editor",
                            });

                            setShowManageAccessModal(false);
                            setSelectedManagedMember(null);
                        }}
                        onRemoveMember={async () => {
                            if (!canAddMembers) {
                                throw new Error("Only the owner can remove members.");
                            }

                            const memberId = selectedManagedMember?.memberId;
                            if (!memberId) {
                                throw new Error("Unable to resolve member ID.");
                            }

                            await removeCareSpaceMember(memberId);
                            setShowManageAccessModal(false);
                            setSelectedManagedMember(null);
                        }}
                    />

                    <AddDependentModal
                        visible={showAddDependentModal}
                        onClose={() => setShowAddDependentModal(false)}
                        dependents={addableDependentNames}
                        onAddDependent={async (name) => {
                            const trimmedName = name.trim();

                            if (trimmedName.length === 0) {
                                setShowAddDependentModal(false);
                                return;
                            }

                            try {
                                if (!canAddMembers) {
                                    throw new Error("Only the owner can add members to this care space.");
                                }

                                const numericCareSpaceId = resolveCareSpaceNumericId();
                                if (!numericCareSpaceId) {
                                    throw new Error("Unable to resolve care space ID.");
                                }

                                const selectedDependent = dependents.find(
                                    (dependent) => dependent.name.trim().toLowerCase() === trimmedName.toLowerCase(),
                                );
                                const targetUserId = selectedDependent?.userId;

                                if (!targetUserId) {
                                    throw new Error("Unable to resolve selected dependent user ID.");
                                }

                                await addMembersToCareSpaceBulk(numericCareSpaceId, [targetUserId]);

                                if (careSpaceId) {
                                    addDependentToCareSpace(careSpaceId, trimmedName);
                                }

                                setDependentNames((prev) => {
                                    const alreadyExists = prev.some(
                                        (item) => item.toLowerCase() === trimmedName.toLowerCase(),
                                    );

                                    return alreadyExists ? prev : [...prev, trimmedName];
                                });

                                setShowAddDependentModal(false);
                            } catch (error) {
                                const message = error instanceof Error ? error.message : "Unable to add dependent.";
                                Alert.alert("Add Member Failed", message);
                            }
                        }}
                    />

                    <DeleteCareSpaceModal
                        visible={showDeleteCareSpaceModal}
                        careSpaceName={spaceName}
                        onCancel={() => setShowDeleteCareSpaceModal(false)}
                        onConfirm={async () => {
                            try {
                                if (!canDeleteCareSpace) {
                                    throw new Error("Only the owner can delete this care space.");
                                }

                                const numericCareSpaceId = resolveCareSpaceNumericId();

                                if (!numericCareSpaceId) {
                                    throw new Error("Unable to resolve care space ID for deletion.");
                                }

                                await deleteCareSpace(numericCareSpaceId);
                                setShowDeleteCareSpaceModal(false);
                                router.back();
                            } catch (error) {
                                const message = error instanceof Error ? error.message : "Unable to delete care space.";
                                Alert.alert("Delete Failed", message);
                            }
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