import AddTaskButton from "@/components/buttons/addTask";
import EditableTaskCard from "@/components/cards/editableTaskCard";
import NoCompletedTask from "@/components/cards/noCompletedTask";
import NoMissingTask from "@/components/cards/noMissingTask";
import NoPendingTask from "@/components/cards/noPendingTask";
import CompleteTaskModal from "@/components/modals/CompleteTaskModal";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import RecurringDayStatusTags, { getRecurringPatternBase } from "@/components/tags/date/recurringDayStatusTags";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import { useAuth } from "@/context/AuthContext";
import { useCareSpaces } from "@/context/CareSpacesContext";
import { useDependents } from "@/context/DependentContext";
import { useTasks } from "@/context/tasksContext";
import { useUser } from "@/context/UserContext";
import { resolveDependentDisplayName, selfDependentContextFromProfile } from "@/utils/resolveDependentDisplayName";
import {
    parseCareSpaceNumericIdFromString,
    parseNumericTaskIdForApi,
    resolveTaskCareSpaceId,
} from "@/utils/resolveTaskCareSpaceId";
import { getResponsiveTokens, scaleByWidth } from "@/utils/responsive";
import { computeComputedTaskStatus, parseLocalDueDateTime } from "@/utils/taskDueDate";
import { isDependentRole } from "@/utils/userRole";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, LayoutAnimation, Platform, Pressable, TextInput as RNTextInput, ScrollView, StatusBar, StyleSheet, Text, UIManager, View, useWindowDimensions } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        fromNotification?: string;
        notificationId?: string;
        notificationType?: string;
        notificationTitle?: string;
        notificationMessage?: string;
        notificationCreatedAt?: string;
    }>();
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const compact = width < 350;
    const narrow = width < 350;
    const stackControls = width < 340;
    const contentMaxWidth = tokens.containerMaxWidth;
    const blockPadding = tokens.sectionPadding;
    const headerPadding = tokens.pagePadding;
    const controlsInset = scaleByWidth(width, 15, 12, 16);
    const titleSize = tokens.title;
    const subtitleSize = tokens.subtitle;
    const statusPillMinWidth = scaleByWidth(width, 96, 88, 112);
    const selectorTextSize = scaleByWidth(width, 15, 12, 15);
    const statusLabelTextSize = scaleByWidth(width, 13, 11, 14);
    const statusIconSize = scaleByWidth(width, 16, 14, 16);
    const { user } = useAuth();
    const { careSpaces } = useCareSpaces();
    const { dependents } = useDependents();
    const { profileData } = useUser();
    const {
        tasks,
        listTasksByMember,
        listMyTasks,
        listCreatedByMeTasks,
        deleteTaskApi,
        completeTaskAsUser,
    } = useTasks();

    const [selectedAssignee, setSelectedAssignee] = useState<"myTasks" | "createdByMe" | number>("myTasks");
    const [selectedCareSpaceId, setSelectedCareSpaceId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [taskLoadError, setTaskLoadError] = useState<string | null>(null);
    const [notificationPreview, setNotificationPreview] = useState<{
        id: string;
        title: string;
        message: string;
        createdAt?: string;
    } | null>(null);
    // For the date and time
    const [nowMs, setNowMs] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);

    const isDependentAccount = useMemo(
        () => isDependentRole(profileData?.role ?? user?.role),
        [profileData?.role, user?.role],
    );

    const selfDependentResolution = useMemo(() => selfDependentContextFromProfile(profileData), [profileData]);

    useEffect(() => {
        if (isDependentAccount && selectedAssignee === "createdByMe") {
            setSelectedAssignee("myTasks");
        }
    }, [isDependentAccount, selectedAssignee]);

    useEffect(() => {
        const fromNotification = params.fromNotification === "1";
        const title = typeof params.notificationTitle === "string" ? params.notificationTitle : "";
        const message = typeof params.notificationMessage === "string" ? params.notificationMessage : "";
        const id = typeof params.notificationId === "string" ? params.notificationId : "";

        if (!fromNotification || !title || !message || !id) {
            return;
        }

        setNotificationPreview({
            id,
            title,
            message,
            createdAt: typeof params.notificationCreatedAt === "string" ? params.notificationCreatedAt : undefined,
        });

        const normalized = `${title} ${message}`.toLowerCase();
        if (normalized.includes("missing") || normalized.includes("overdue")) {
            setSelectedStatus("missing");
        }

        const taskTitleMatch = message.match(/^(.+?)\s+is now marked as missing\.?$/i);
        if (taskTitleMatch?.[1]) {
            setSearchQuery(taskTitleMatch[1].trim());
        }
    }, [
        params.fromNotification,
        params.notificationId,
        params.notificationTitle,
        params.notificationMessage,
        params.notificationCreatedAt,
    ]);

    const tasksInUserCareSpaces = useMemo(() => {
        const numericIds = careSpaces
            .map((cs) => parseCareSpaceNumericIdFromString(cs.id))
            .filter((n): n is number => typeof n === "number" && n > 0);
        if (numericIds.length === 0) return [];
        return tasks.filter((task) => {
            if (task.careSpaceId == null) return false;
            return numericIds.includes(task.careSpaceId);
        });
    }, [tasks, careSpaces]);

    const careSpaceRoleById = useMemo(() => {
        const roleMap = new Map<number, string | undefined>();

        careSpaces.forEach((careSpace) => {
            const numericId = parseCareSpaceNumericIdFromString(careSpace.id);
            if (typeof numericId === "number" && numericId > 0) {
                roleMap.set(numericId, careSpace.currentUserRole);
            }
        });

        return roleMap;
    }, [careSpaces]);

    const canManageTaskInCareSpace = (taskCareSpaceId?: number) => {
        if (isDependentAccount) return false;
        if (typeof taskCareSpaceId !== "number") return true;

        const role = careSpaceRoleById.get(taskCareSpaceId);
        return role === "Owner" || role === "Editor";
    };

    const fallbackSingleCareSpaceNumericId = useMemo(() => {
        if (careSpaces.length !== 1) return null;
        const n = parseCareSpaceNumericIdFromString(careSpaces[0].id);
        return typeof n === "number" && n > 0 ? n : null;
    }, [careSpaces]);

    const resolveCareSpaceId = (id: string) => {
        const match = id.match(/(\d+)$/);
        return match ? Number(match[1]) : null;
    };

    const careSpaceOptions = careSpaces
        .map((careSpace) => {
            const numericId = resolveCareSpaceId(careSpace.id);
            if (!numericId) return null;

            return {
                id: numericId,
                title: careSpace.title,
            };
        })
        .filter((item): item is { id: number; title: string } => !!item);

    const dependentOptions = dependents
        .map((dependent) => {
            const userId = dependent.userId ?? dependent.dependentId;

            if (!userId || !Number.isInteger(userId) || userId <= 0) {
                return null;
            }

            return {
                userId,
                name: dependent.name,
            };
        })
        .filter((item): item is { userId: number; name: string } => !!item);

    const memberUserIdsByCareSpace = useMemo(() => {
        const result = new Map<number, number[]>();

        careSpaces.forEach((careSpace) => {
            const numericCareSpaceId = parseCareSpaceNumericIdFromString(careSpace.id);
            if (typeof numericCareSpaceId !== "number" || numericCareSpaceId <= 0) {
                return;
            }

            const ids = [
                ...(careSpace.familyMembers || []).map((member) => member.userId),
                ...(careSpace.caregivers || []).map((member) => member.userId),
                ...(careSpace.dependents || []).map((dependent) => dependent.userId),
            ].filter((id): id is number => typeof id === "number" && id > 0);

            if (ids.length > 0) {
                result.set(numericCareSpaceId, [...new Set(ids)]);
            }
        });

        return result;
    }, [careSpaces]);

    const fetchSharedCareSpaceTasks = async (statusQuery: "pending" | "completed" | "missed") => {
        const scopedCareSpaceIds = selectedCareSpaceId === null
            ? Array.from(memberUserIdsByCareSpace.keys())
            : [selectedCareSpaceId];

        const memberRequests: Array<Promise<unknown>> = [];
        const seen = new Set<string>();

        scopedCareSpaceIds.forEach((careSpaceNumericId) => {
            const memberUserIds = memberUserIdsByCareSpace.get(careSpaceNumericId) || [];
            memberUserIds.forEach((memberUserId) => {
                const key = `${careSpaceNumericId}-${memberUserId}`;
                if (seen.has(key)) {
                    return;
                }

                seen.add(key);
                memberRequests.push(
                    listTasksByMember(memberUserId, careSpaceNumericId).catch(() => undefined),
                );
            });
        });

        if (memberRequests.length > 0) {
            await Promise.all(memberRequests);
        }

        await listMyTasks({ dateFilter: "all", status: statusQuery });
        await listCreatedByMeTasks({ dateFilter: "all", status: statusQuery });
    };

    const selectedAssigneeLabel =
        selectedAssignee === "myTasks"
            ? "My tasks"
            : selectedAssignee === "createdByMe"
                ? narrow
                    ? "Created by Me"
                    : "Tasks Created by Me"
                : dependentOptions.find((option) => option.userId === selectedAssignee)?.name || "Select Dependent";

    const selectedCareSpaceLabel =
        selectedCareSpaceId === null
            ? narrow
                ? "All Spaces"
                : "All Care Spaces"
            : careSpaceOptions.find((option) => option.id === selectedCareSpaceId)?.title || "Select Care Space";

    useEffect(() => {
        let isMounted = true;

        const statusQuery =
            selectedStatus === "missing"
                ? "missed"
                : (selectedStatus as "pending" | "completed");

        const loadTasks = async () => {
            setLoadingTasks(true);
            setTaskLoadError(null);

            try {
                if (selectedAssignee === "myTasks") {
                    await fetchSharedCareSpaceTasks(statusQuery);
                    return;
                }

                if (selectedAssignee === "createdByMe") {
                    await listCreatedByMeTasks({ dateFilter: "all", status: statusQuery });
                    return;
                }

                if (!selectedCareSpaceId) {
                    if (isMounted) {
                        setTaskLoadError("Select a care space to load tasks for this dependent.");
                    }
                    return;
                }

                await listTasksByMember(selectedAssignee, selectedCareSpaceId);
            } catch (err) {
                if (isMounted) {
                    setTaskLoadError((err as Error).message || "Unable to load tasks.");
                }
            } finally {
                if (isMounted) {
                    setLoadingTasks(false);
                }
            }
        };

        loadTasks();

        return () => {
            isMounted = false;
        };
        // Do not depend on listMyTasks / listCreatedByMeTasks / listTasksByMember — they are new
        // function references on every TasksProvider render, which would retrigger this effect
        // after every fetch (setTasks) and keep "Loading tasks..." stuck on screen.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- list* from context intentionally omitted
    }, [selectedAssignee, selectedCareSpaceId, selectedStatus, memberUserIdsByCareSpace]);
    const decoratedTasks = tasksInUserCareSpaces.map((task) => {
        const due = parseLocalDueDateTime(task.dueDate, task.dueTime);
        const computedStatus = computeComputedTaskStatus(task.status, due, nowMs);
        return { ...task, computedStatus };
    });

    StatusBar.setBarStyle("dark-content");

    const currentUserId = profileData?.user_id;
    const normalizedKeywordTokens = searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    const filteredTasks = decoratedTasks.filter((task) => {
        const matchesStatus = task.computedStatus === selectedStatus;

        if (!matchesStatus) {
            return false;
        }

        if (selectedCareSpaceId != null && task.careSpaceId != null && task.careSpaceId !== selectedCareSpaceId) {
            return false;
        }

        if (typeof currentUserId === "number" && currentUserId > 0) {
            if (selectedAssignee === "createdByMe") {
                if (task.assignedByUserId != null && task.assignedByUserId !== currentUserId) {
                    return false;
                }
            } else if (typeof selectedAssignee === "number") {
                if (task.assignedUserIds && task.assignedUserIds.length > 0) {
                    if (!task.assignedUserIds.includes(selectedAssignee)) {
                        return false;
                    }
                }
            }
        }

        if (normalizedKeywordTokens.length === 0) {
            return true;
        }

        const titleText = (task.title ?? "").toLowerCase();
        const descriptionText = (task.description ?? "").toLowerCase();
        const dependentText = resolveDependentDisplayName(task, dependents, selfDependentResolution, careSpaces).toLowerCase();
        const searchableText = `${titleText} ${descriptionText} ${dependentText}`;

        return normalizedKeywordTokens.every((token) => searchableText.includes(token));
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
                const year = parsed.getFullYear();
                const month = String(parsed.getMonth() + 1).padStart(2, "0");
                const day = String(parsed.getDate()).padStart(2, "0");
                const time = parsed.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
                return `${year}-${month}-${day} ${time}`;
            })()
            : [dueDate, dueTime?.toUpperCase()].filter(Boolean).join(" ");

        return (
            <View style={styles.datePill}>
                <Text style={styles.datePillText} allowFontScaling={false} numberOfLines={1}>{label}</Text>
            </View>
        );
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={[styles.container, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }] }>
                    <View style={[styles.headerContainer, { padding: headerPadding }, compact && styles.headerContainerCompact]}>
                        <View style={styles.headerTextWrap}>
                            <Text style={[styles.headerTitle, { fontSize: titleSize }]}>Tasks</Text>
                            <Text style={[styles.subHeader, { fontSize: subtitleSize }]}>Manage caregiving activities</Text>
                        </View>
                        {!isDependentAccount && <AddTaskButton style={compact && styles.headerActionButtonCompact} />}
                    </View>

                    {notificationPreview && (
                        <View style={[styles.notificationPreviewCard, { marginHorizontal: controlsInset }]}>
                            <Text style={styles.notificationPreviewTitle}>{notificationPreview.title}</Text>
                            <Text style={styles.notificationPreviewMessage}>{notificationPreview.message}</Text>
                            <Pressable onPress={() => setNotificationPreview(null)}>
                                <Text style={styles.notificationPreviewDismiss}>Dismiss</Text>
                            </Pressable>
                        </View>
                    )}
                    
                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { marginHorizontal: controlsInset }]}>
                        <Feather name="search" size={20} color="#999" />
                        <RNTextInput
                            style={styles.searchInput}
                            placeholder="Search tasks..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Dependents and care spaces dropdown */}
                    <View style={[styles.sortingContainer, { paddingHorizontal: controlsInset, gap: scaleByWidth(width, 10, 8, 14) }, stackControls && styles.sortingContainerCompact]}>
                        <View style={styles.dropdownColumn}>
                            <Menu
                                visible={menuVisible1}
                                onDismiss={() => setMenuVisible1(false)}
                                anchor={
                                <Pressable onPress={() => setMenuVisible1(true)} style={styles.dropdownAnchor}>
                                    <TextInput
                                    value={selectedAssigneeLabel}
                                    mode="outlined"
                                    editable={false}
                                    pointerEvents="none"
                                    right={<TextInput.Icon icon="menu-down" />}
                                    outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                                    style={[styles.inputField, { fontSize: selectorTextSize }, narrow && styles.inputFieldCompact]}
                                    contentStyle={{ fontSize: selectorTextSize }}
                                    />
                                </Pressable>
                                }
                                contentStyle={styles.dropdownContent}
                                style={styles.dropdown}
                            >
                            <Menu.Item
                                onPress={() => {
                                    setSelectedAssignee("myTasks");
                                    setMenuVisible1(false);
                                }}
                                title="My tasks"
                                titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]}
                            />
                            {!isDependentAccount && (
                                <Menu.Item
                                    onPress={() => {
                                        setSelectedAssignee("createdByMe");
                                        setMenuVisible1(false);
                                    }}
                                    title="Tasks Created by Me"
                                    titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]}
                                />
                            )}
                            {dependentOptions.map((option) => (
                                <Menu.Item
                                    key={`dep-option-${option.userId}`}
                                    onPress={() => {
                                        setSelectedAssignee(option.userId);
                                        setMenuVisible1(false);
                                    }}
                                    title={option.name}
                                    titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]}
                                />
                            ))}
                            </Menu>
                        </View>

                        {/* Drop down 2 */}
                        <View style={styles.dropdownColumn}>
                            <Menu
                                visible={menuVisible2}
                                onDismiss={() => setMenuVisible2(false)}
                                anchor={
                                <Pressable onPress={() => setMenuVisible2(true)} style={styles.dropdownAnchor}>
                                    <TextInput
                                    value={selectedCareSpaceLabel}
                                    mode="outlined"
                                    editable={false}
                                    pointerEvents="none"
                                    right={<TextInput.Icon icon="menu-down" />}
                                    outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                                    style={[styles.inputField, { fontSize: selectorTextSize }, narrow && styles.inputFieldCompact]}
                                    contentStyle={{ fontSize: selectorTextSize }}
                                    />
                                </Pressable>
                                }
                                contentStyle={styles.dropdownContent}
                                style={styles.dropdown2}
                            >
                            <Menu.Item
                                onPress={() => {
                                    setSelectedCareSpaceId(null);
                                    setMenuVisible2(false);
                                }}
                                title="All Care Spaces"
                                titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]}
                            />
                            {careSpaceOptions.map((option) => (
                                <Menu.Item
                                    key={`care-space-${option.id}`}
                                    onPress={() => {
                                        setSelectedCareSpaceId(option.id);
                                        setMenuVisible2(false);
                                    }}
                                    title={option.title}
                                    titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]}
                                />
                            ))}
                            </Menu>
                        </View>
                    </View>
                    
                    {/* This is the status button container (Pending, Completed, Missing) */}
                    <View style={[styles.toDoListContainer, { paddingHorizontal: controlsInset, paddingVertical: blockPadding }]}>
                        <View style={[styles.toDoButtons, stackControls && styles.toDoButtonsCompact]}>
                            <Pressable 
                                style={[styles.pendingButton, { minWidth: statusPillMinWidth }, selectedStatus === "pending" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("pending");
                                }}
                            >
                                <Feather name="clock" size={statusIconSize} color={selectedStatus === "pending" ? "white" : "black"} />
                                <Text numberOfLines={1} style={[styles.statusButtonLabel, { fontSize: statusLabelTextSize }, selectedStatus === "pending" && styles.activeButtonText]}>Pending</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.completedButton, { minWidth: statusPillMinWidth }, selectedStatus === "completed" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("completed");
                                }}
                            >
                                <Feather name="check-circle" size={statusIconSize} color={selectedStatus === "completed" ? "white" : "black"} />
                                <Text numberOfLines={1} style={[styles.statusButtonLabel, { fontSize: statusLabelTextSize }, selectedStatus === "completed" && styles.activeButtonText]}>Completed</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.missingButton, { minWidth: statusPillMinWidth }, selectedStatus === "missing" && styles.activeButton]} 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setSelectedStatus("missing");
                                }}
                            >
                                <AntDesign name="exclamation-circle" size={statusIconSize} color={selectedStatus === "missing" ? "white" : "black"} />
                                <Text numberOfLines={1} style={[styles.statusButtonLabel, { fontSize: statusLabelTextSize }, selectedStatus === "missing" && styles.activeButtonText]}>Missing</Text>
                            </Pressable>
                        </View>

                        {/* Task Cards Display */}
                        <View style={styles.taskCardsContainer}>
                            {loadingTasks && <Text style={styles.feedbackText}>Loading tasks...</Text>}
                            {!!taskLoadError && <Text style={styles.errorText}>{taskLoadError}</Text>}
                            {!loadingTasks && selectedStatus === "pending" && filteredTasks.length === 0 && (
                                <NoPendingTask />
                            )}
                            {!loadingTasks && selectedStatus === "completed" && filteredTasks.length === 0 && (
                                <NoCompletedTask />
                            )}
                            {!loadingTasks && selectedStatus === "missing" && filteredTasks.length === 0 && (
                                <NoMissingTask />
                            )}
                            {/* This is for the insert function, this will display the created task */}
                            {filteredTasks.map((task) => (
                                (() => {
                                    const canManageTask = canManageTaskInCareSpace(task.careSpaceId);
                                    return (
                                <EditableTaskCard
                                    key={task.id}
                                    value={task.id}
                                    selectedTask={null}
                                    onSelect={() => {}}
                                    editable={canManageTask}
                                    isCompleted={task.computedStatus === "completed"}
                                    onRadioPress={
                                        !canManageTask
                                            ? undefined
                                            : task.computedStatus !== "completed"
                                              ? () => setPendingCompleteId(task.id)
                                              : undefined
                                    }
                                    title={task.title}
                                    dependent={resolveDependentDisplayName(task, dependents, selfDependentResolution, careSpaces)}
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
                                    onEdit={
                                        canManageTask
                                            ? () =>
                                                router.push({
                                                    pathname: "/editTaskPage",
                                                    params: {
                                                        id: task.id,
                                                        careSpaceId: task.careSpaceId ? String(task.careSpaceId) : undefined,
                                                    },
                                                })
                                            : undefined
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
                                    onDelete={canManageTask ? () => setPendingDeleteId(task.id) : undefined}
                                />
                                    );
                                })()
                            ))}
                                                <CompleteTaskModal
                                                    visible={pendingCompleteId !== null}
                                                    taskTitle={tasks.find((t) => t.id === pendingCompleteId)?.title}
                                                    loading={completing}
                                                    onConfirm={async () => {
                                                        if (!pendingCompleteId) {
                                                            setPendingCompleteId(null);
                                                            return;
                                                        }
                                                        setCompleting(true);
                                                        try {
                                                            const task = tasks.find((t) => t.id === pendingCompleteId);
                                                            if (!task) throw new Error("Task not found");
                                                            await completeTaskAsUser(task);
                                                            const refreshStatus =
                                                                selectedStatus === "missing"
                                                                    ? "missed"
                                                                    : (selectedStatus as "pending" | "completed");
                                                            if (selectedAssignee === "myTasks") {
                                                                await fetchSharedCareSpaceTasks(refreshStatus);
                                                            } else if (selectedAssignee === "createdByMe") {
                                                                await listCreatedByMeTasks({
                                                                    dateFilter: "all",
                                                                    status: selectedStatus as "pending" | "completed" | "missed",
                                                                });
                                                            } else if (selectedCareSpaceId) {
                                                                await listTasksByMember(selectedAssignee, selectedCareSpaceId);
                                                            }
                                                            setPendingCompleteId(null);
                                                        } catch (error) {
                                                            Alert.alert("Complete failed", error instanceof Error ? error.message : "Unable to complete task.");
                                                        } finally {
                                                            setCompleting(false);
                                                        }
                                                    }}
                                                    onCancel={() => setPendingCompleteId(null)}
                                                />
                        </View>

                        <DeleteTaskModal
                            visible={pendingDeleteId !== null}
                            taskTitle={tasks.find((t) => t.id === pendingDeleteId)?.title}
                            onConfirm={async () => {
                                if (!pendingDeleteId) {
                                    setPendingDeleteId(null);
                                    return;
                                }

                                const taskToDelete = tasks.find((t) => t.id === pendingDeleteId);
                                const numericTaskId = parseNumericTaskIdForApi(pendingDeleteId, taskToDelete?.id);
                                const numericCareSpaceId = resolveTaskCareSpaceId(taskToDelete, {
                                    filterCareSpaceId: selectedCareSpaceId,
                                    fallbackSingleCareSpaceNumericId,
                                });
                                if (numericTaskId === null || numericTaskId <= 0) {
                                    Alert.alert("Delete failed", "Unable to resolve task ID.");
                                    return;
                                }
                                if (numericCareSpaceId === undefined) {
                                    Alert.alert("Delete failed", "Unable to resolve care space ID for this task.");
                                    return;
                                }

                                if (!canManageTaskInCareSpace(numericCareSpaceId)) {
                                    Alert.alert("Permission Denied", "Only care space owners or editors can delete tasks in this care space.");
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
        gap: 10,
    },

    headerContainerCompact: {
        alignItems: "flex-start",
        flexWrap: "wrap",
    },

    headerTextWrap: {
        flexShrink: 1,
        minWidth: 0,
    },

    headerActionButtonCompact: {
        alignSelf: "flex-start",
    },

    notificationPreviewCard: {
        backgroundColor: "#FFF7ED",
        borderColor: "#FDBA74",
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        gap: 6,
    },

    notificationPreviewTitle: {
        color: "#9A3412",
        fontWeight: "700",
        fontSize: 15,
    },

    notificationPreviewMessage: {
        color: "#7C2D12",
        fontSize: 13,
    },

    notificationPreviewDismiss: {
        color: "#B45309",
        fontWeight: "700",
        fontSize: 12,
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
        fontSize: 12,
    },

    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    // Dropdown styles
    inputField: {
        width: "100%",
        height: 35,
        backgroundColor: "#ffffff",
    },

    inputFieldCompact: {
        height: 34,
    },

    dropdown: {
        padding: 0,
        borderRadius: 16,
        marginTop: 35,
    },

    dropdown2: {
        padding: 0,
        borderRadius: 16,
        marginTop: 35,
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
        paddingHorizontal: 20,
        paddingVertical: 8,
        paddingTop: 0,
        paddingBottom: 0,
        gap: 10,
    },

    sortingContainerCompact: {
        flexDirection: "column",
        alignItems: "stretch",
    },

    dropdownColumn: {
        flex: 1,
        minWidth: 0,
    },

    dropdownAnchor: {
        width: "100%",
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
        gap: 6,
    },

    toDoButtonsCompact: {
        borderRadius: 16,
        flexWrap: "wrap",
    },

    // Status filter buttons
    pendingButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 96,
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 100,
    },

    completedButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 96,
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 100,
    },

    missingButton: {
        fontSize: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 96,
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 100,
    },

    statusButtonLabel: {
        fontSize: 14,
        color: "#000000",
        flexShrink: 1,
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

    feedbackText: {
        color: "#374151",
        fontSize: 14,
        marginBottom: 8,
    },

    errorText: {
        color: "#B91C1C",
        fontSize: 14,
        marginBottom: 8,
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