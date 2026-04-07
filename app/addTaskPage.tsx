import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Checkbox, Menu, Switch, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import FriButton from '../components/buttons/recurringDate/friButton';
import MonButton from '../components/buttons/recurringDate/monButton';
import SatButton from '../components/buttons/recurringDate/satButton';
import SunButton from '../components/buttons/recurringDate/sunButton';
import ThuButton from '../components/buttons/recurringDate/thursButton';
import TueButton from '../components/buttons/recurringDate/tuesButton';
import WedButton from '../components/buttons/recurringDate/wedButton';
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import CustomTimePickerModal from '../components/modals/CustomTimePickerModal';
import ReminderModal from "../components/modals/reminderModal";
import { useCareSpaces } from "../context/CareSpacesContext";
import { useDependents } from "../context/DependentContext";
import { useNotifications } from "../context/notificationContext";
import { useTasks } from "../context/tasksContext";
import { useUser } from "../context/UserContext";

export default function AddTaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        from?: string;
        careSpaceId?: string;
        careSpaceTitle?: string;
        dependentUserIds?: string;
        scopedDependents?: string;
    }>();
    const { createTask } = useTasks();
    const { createNotification, sendLocalTestNotification, addInAppNotification, listMyNotifications } = useNotifications();
    const { careSpaces } = useCareSpaces();
    const { dependents } = useDependents();
    const { profileData } = useUser();
    StatusBar.setBarStyle("dark-content");
    // For Dropdowns
    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
    const [recurringPatternMenuVisible, setRecurringPatternMenuVisible] = useState(false);
    const [careSpaceType, setCareSpace] = useState("Select Care Space");
    const [dependentType, setDependent] = useState("Select Dependent");
    const [selectedCareSpaceId, setSelectedCareSpaceId] = useState<number | null>(null);
    const [selectedDependentUserId, setSelectedDependentUserId] = useState<number | null>(null);
    const [priority, setPriority] = useState("Select Priority");
    const [recurringPattern, setRecurringPattern] = useState("Select Recurring Pattern");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [applyToAll, setApplyToAll] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // For Switches
    const [isRecurring, setIsRecurring] = useState(false);
    const [isReminderEnabled, setIsReminderEnabled] = useState(false);
    const [selectedRecurringDays, setSelectedRecurringDays] = useState<number[]>([]);
    // For Date and Time Pickers
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const formatDateYMD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [dateInputValue, setDateInputValue] = useState(formatDateYMD(new Date()));
    const [dueTime, setDueTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timeInputValue, setTimeInputValue] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
    const [reminderTimeInputValue, setReminderTimeInputValue] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));

    const resolveCareSpaceNumericId = (careSpaceIdStr: string) => {
        const match = careSpaceIdStr.match(/(\d+)$/);
        return match ? Number.parseInt(match[1], 10) : Number.parseInt(careSpaceIdStr.replace("care-space-", ""), 10);
    };

    const canManageTasksInCareSpace = (role?: string) => role === "Owner" || role === "Editor";

    const resolveEffectiveRoleInCareSpace = (careSpace: typeof careSpaces[number]) => {
        if (careSpace.currentUserRole) {
            return careSpace.currentUserRole;
        }

        const currentUserId = profileData?.user_id;
        if (typeof currentUserId !== "number" || currentUserId <= 0) {
            return undefined;
        }

        const familyRole = (careSpace.familyMembers || []).find((member) => member.userId === currentUserId)?.role;
        if (familyRole) {
            return familyRole;
        }

        const caregiverRole = (careSpace.caregivers || []).find((member) => member.userId === currentUserId)?.role;
        if (caregiverRole) {
            return caregiverRole;
        }

        const isDependentInCareSpace = (careSpace.dependents || []).some((dependent) => dependent.userId === currentUserId);
        if (isDependentInCareSpace) {
            return "Viewer";
        }

        return undefined;
    };

    const manageableCareSpaces = useMemo(
        () =>
            careSpaces.filter((careSpace) => {
                const effectiveRole = resolveEffectiveRoleInCareSpace(careSpace);
                return canManageTasksInCareSpace(effectiveRole);
            }),
        [careSpaces, profileData?.user_id],
    );

    const isScopedFromCareSpaceSettings = params.from === "careSpaceSettings";
    const parsedRouteCareSpaceId = useMemo(() => {
        if (!params.careSpaceId) return null;
        const parsed = Number.parseInt(params.careSpaceId, 10);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }, [params.careSpaceId]);

    const scopedDependentUserIds = useMemo(() => {
        if (!params.dependentUserIds) return [] as number[];

        try {
            const parsed = JSON.parse(params.dependentUserIds);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((id): id is number => Number.isInteger(id) && id > 0);
        } catch {
            return [];
        }
    }, [params.dependentUserIds]);

    const scopedDependentsFromParams = useMemo(() => {
        if (!params.scopedDependents) return [] as Array<{ userId: number; name: string; key: string }>;

        try {
            const parsed = JSON.parse(params.scopedDependents);
            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter((item) => typeof item?.userId === "number" && item.userId > 0 && typeof item?.name === "string")
                .map((item) => ({
                    userId: item.userId as number,
                    name: (item.name as string).trim(),
                    key: `scoped-${item.userId}`,
                }))
                .filter((item) => item.name.length > 0);
        } catch {
            return [];
        }
    }, [params.scopedDependents]);

    const selectableDependents = useMemo(
        () =>
            dependents
                .map((dependent) => {
                    const resolvedUserId = dependent.userId;
                    if (typeof resolvedUserId !== "number" || resolvedUserId <= 0) {
                        return null;
                    }

                    return {
                        userId: resolvedUserId,
                        name: dependent.name,
                        key: `dep-${dependent.id}-${resolvedUserId}`,
                    };
                })
                .filter((item): item is { userId: number; name: string; key: string } => !!item),
        [dependents],
    );

    const careSpaceDependentsById = useMemo(() => {
        const map = new Map<number, Array<{ userId: number; name: string; key: string }>>();

        careSpaces.forEach((careSpace) => {
            const numericCareSpaceId = resolveCareSpaceNumericId(careSpace.id);
            if (!Number.isInteger(numericCareSpaceId) || numericCareSpaceId <= 0) {
                return;
            }

            const scoped = (careSpace.dependents || [])
                .map((dependent) => {
                    if (typeof dependent.userId === "number" && dependent.userId > 0) {
                        return {
                            userId: dependent.userId,
                            name: dependent.name,
                            key: `cs-${numericCareSpaceId}-dep-${dependent.userId}`,
                        };
                    }

                    const localMatch = selectableDependents.find(
                        (item) => item.name.trim().toLowerCase() === dependent.name.trim().toLowerCase(),
                    );

                    if (!localMatch) {
                        return null;
                    }

                    return {
                        userId: localMatch.userId,
                        name: localMatch.name,
                        key: `cs-${numericCareSpaceId}-dep-${localMatch.userId}`,
                    };
                })
                .filter((item): item is { userId: number; name: string; key: string } => !!item && item.name.trim().length > 0);

            if (scoped.length > 0) {
                const unique = Array.from(new Map(scoped.map((item) => [item.userId, item])).values());
                map.set(numericCareSpaceId, unique);
            }
        });

        return map;
    }, [careSpaces, selectableDependents]);

    const scopedDependents = useMemo(() => {
        if (!isScopedFromCareSpaceSettings) {
            return selectableDependents;
        }

        if (scopedDependentUserIds.length === 0) {
            return [] as typeof selectableDependents;
        }

        const allowedIdSet = new Set(scopedDependentUserIds);
        return selectableDependents.filter((dependent) => {
            return allowedIdSet.has(dependent.userId);
        });
    }, [isScopedFromCareSpaceSettings, scopedDependentUserIds, selectableDependents]);

    const availableDependents = useMemo(() => {
        if (isScopedFromCareSpaceSettings) {
            return scopedDependentsFromParams.length > 0 ? scopedDependentsFromParams : scopedDependents;
        }

        if (typeof selectedCareSpaceId === "number" && selectedCareSpaceId > 0) {
            return careSpaceDependentsById.get(selectedCareSpaceId) || [];
        }

        return selectableDependents;
    }, [
        isScopedFromCareSpaceSettings,
        scopedDependentsFromParams,
        scopedDependents,
        selectedCareSpaceId,
        careSpaceDependentsById,
        selectableDependents,
    ]);

    useEffect(() => {
        if (!isScopedFromCareSpaceSettings) {
            return;
        }

        if (parsedRouteCareSpaceId) {
            setSelectedCareSpaceId(parsedRouteCareSpaceId);

            const matchedCareSpace = careSpaces.find((space) => resolveCareSpaceNumericId(space.id) === parsedRouteCareSpaceId);
            setCareSpace(params.careSpaceTitle || matchedCareSpace?.title || "Selected Care Space");

            if (matchedCareSpace && !canManageTasksInCareSpace(resolveEffectiveRoleInCareSpace(matchedCareSpace))) {
                Alert.alert("Permission Denied", "Only care space owners or editors can create tasks in this care space.");
                router.back();
                return;
            }
        }

        const hasScopedDependents = (scopedDependentsFromParams.length > 0 || scopedDependentUserIds.length > 0);
        setApplyToAll(hasScopedDependents);
        setDependent(hasScopedDependents ? "All Dependents" : "Select Dependent");
        setSelectedDependentUserId(null);
    }, [
        careSpaces,
        isScopedFromCareSpaceSettings,
        params.careSpaceTitle,
        parsedRouteCareSpaceId,
        scopedDependentUserIds.length,
        scopedDependentsFromParams.length,
    ]);

    const handleDateChange = (date: Date) => {
        setDueDate(date);
        setDateInputValue(formatDateYMD(date));
    };

    const handleCloseDatePicker = () => {
        setShowDatePicker(false);
    };

    const handleTimeChange = (time: Date) => {
        setDueTime(time);
        setTimeInputValue(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };

    const handleCloseTimePicker = () => {
        setShowTimePicker(false);
    };

    const handleReminderTimeChange = (time: Date) => {
        setReminderTime(time);
        setReminderTimeInputValue(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };

    const handleCloseReminderTimePicker = () => {
        setShowReminderTimePicker(false);
    };

    const requiresSpecificDays = isRecurring && (recurringPattern === "Weekly" || recurringPattern === "Custom (Specific Days)");

    const toggleRecurringDay = (day: number) => {
        setSelectedRecurringDays((prev) => {
            if (prev.includes(day)) {
                return prev.filter((existingDay) => existingDay !== day);
            }

            return [...prev, day].sort((a, b) => a - b);
        });
    };

    const formatRecurringDaysLabel = (days: number[]) => {
        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days.map((day) => labels[day]).join(", ");
    };

    const isInPast = () => {
        const now = new Date();
        const datePart = dueDate;
        const timePart = reminderTime;
        if (!datePart) return false;
        const combined = new Date(datePart);
        combined.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
        return combined.getTime() < now.getTime();
    };

    const handleManualDateInput = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 8); // YYYYMMDD max
        let formatted = digits;
        if (digits.length > 4) {
            formatted = `${digits.slice(0, 4)}/${digits.slice(4)}`;
        }
        if (digits.length > 6) {
            formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
        }
        setDateInputValue(formatted);

        const match = formatted.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (!match) {
            return;
        }

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        const parsedDate = new Date(year, month - 1, day);

        if (
            !isNaN(parsedDate.getTime()) &&
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
        ) {
            setDueDate(parsedDate);
        }
    };

    const handleManualTimeInput = (text: string) => {
        setTimeInputValue(text);
        // Try to parse the input as time (HH:MM in 24-hour format or 12-hour with AM/PM)
        const timeRegex = /(\d{1,2}):(\d{2})(\s?(AM|PM|am|pm))?/;
        const match = text.match(timeRegex);
        if (match) {
            let hour = parseInt(match[1]);
            const minute = parseInt(match[2]);
            const meridiem = match[4]?.toUpperCase();
            
            // Convert 12-hour to 24-hour if AM/PM provided
            if (meridiem === 'PM' && hour !== 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;
            
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                const newTime = new Date(dueTime);
                newTime.setHours(hour, minute, 0);
                setDueTime(newTime);
            }
        }
    };

    const handleManualReminderTimeInput = (text: string) => {
        setReminderTimeInputValue(text);
        const timeRegex = /(\d{1,2}):(\d{2})(\s?(AM|PM|am|pm))?/;
        const match = text.match(timeRegex);
        if (match) {
            let hour = parseInt(match[1]);
            const minute = parseInt(match[2]);
            const meridiem = match[4]?.toUpperCase();

            if (meridiem === 'PM' && hour !== 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;

            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                const newTime = new Date(reminderTime);
                newTime.setHours(hour, minute, 0);
                setReminderTime(newTime);
            }
        }
    };

    // Do not require due time to be in the future — same-day overdue times should still allow create.
    // (Reminder UI still uses isInPast() separately.)
    const isFormValid = Boolean(
        title.trim() &&
        selectedCareSpaceId &&
        (applyToAll
            ? availableDependents.length > 0
            : typeof selectedDependentUserId === "number" && selectedDependentUserId > 0) &&
        priority !== "Select Priority" &&
        dateInputValue.trim() &&
        (!requiresSpecificDays || selectedRecurringDays.length > 0),
    );

    const toIsoFromDateTime = (date: Date, time: Date) => {
        const merged = new Date(date);
        merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return merged.toISOString();
    };

    const handleSaveTask = async () => {
        if (!isFormValid) return;

        const recurringValue = isRecurring && recurringPattern !== "Select Recurring Pattern"
            ? recurringPattern
            : null;

        const dueDateIso = toIsoFromDateTime(dueDate, dueTime);

        const buildIsoForWeekday = (targetWeekday: number) => {
            const dayDate = new Date(dueDate);
            const currentWeekday = dayDate.getDay();
            const dayOffset = (targetWeekday - currentWeekday + 7) % 7;

            dayDate.setDate(dayDate.getDate() + dayOffset);
            dayDate.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);

            return dayDate.toISOString();
        };

        const dayBasedRecurrenceType = recurringValue === "Weekly" ? "weekly" : "custom";

        const weeklyScheduleData = selectedRecurringDays.map((day) => {
            const dayIso = buildIsoForWeekday(day);

            return {
                start_time: dayIso,
                end_time: dayIso,
                recurrence_type: dayBasedRecurrenceType as "weekly" | "custom",
                recurrence_days: day,
            };
        });

        const scheduleData = !recurringValue
            ? [
                {
                    start_time: dueDateIso,
                    end_time: dueDateIso,
                    recurrence_type: "none" as const,
                    recurrence_days: 0,
                },
            ]
            : recurringValue === "Daily"
                ? [
                    {
                        start_time: dueDateIso,
                        end_time: dueDateIso,
                        recurrence_type: "daily" as const,
                        recurrence_days: 1,
                    },
                ]
                : weeklyScheduleData;

        const rawAssignedUserIds = applyToAll
            ? availableDependents
                .map((dependent) => dependent.userId)
                  .filter((id): id is number => typeof id === "number" && id > 0)
            : (selectedDependentUserId ? [selectedDependentUserId] : []);

        const selectedCareSpace = careSpaces.find((space) => resolveCareSpaceNumericId(space.id) === selectedCareSpaceId);
        const validMemberIds = new Set(
            [
                ...(selectedCareSpace?.familyMembers || []).map((m) => m.userId),
                ...(selectedCareSpace?.caregivers || []).map((m) => m.userId),
                ...(selectedCareSpace?.dependents || []).map((m) => m.userId),
            ].filter((id): id is number => typeof id === "number" && id > 0),
        );

        const assignedUserIds = rawAssignedUserIds.filter((id) => {
            if (validMemberIds.size === 0) {
                return true;
            }

            return validMemberIds.has(id);
        });

        if (assignedUserIds.length === 0) {
            Alert.alert("Create Task Failed", "Please select a valid dependent in this care space.");
            return;
        }

        try {
            setSubmitting(true);

            await createTask({
                careSpaceId: selectedCareSpaceId as number,
                dependentName: applyToAll ? "All Dependents" : dependentType,
                assignedUserIds,
                taskData: {
                    title: title.trim(),
                    description: description.trim(),
                    dueDate: formatDateYMD(dueDate),
                    dueTime: dueTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    dueAtIso: dueDateIso,
                    priority,
                    recurringPattern:
                        recurringValue && selectedRecurringDays.length > 0
                            ? `${recurringValue}: ${formatRecurringDaysLabel(selectedRecurringDays)}`
                            : recurringValue,
                    reminderEnabled: isReminderEnabled,
                },
                scheduleData: scheduleData as any,
            });

            const dueLabel = `${formatDateYMD(dueDate)} ${dueTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })}`;
            const dependentsLabel = applyToAll ? "All Dependents" : dependentType;
            const recurrenceLabel = recurringValue ?? "None";
            const notifTitle = "Task created";
            const notifMessage = `${title.trim()} was created successfully. Due: ${dueLabel}. Priority: ${priority}. Assigned to: ${dependentsLabel}. Recurrence: ${recurrenceLabel}.`;

            // Always reflect task creation in the in-app notification list immediately.
            addInAppNotification(notifTitle, notifMessage);

            if (typeof profileData?.user_id === "number" && profileData.user_id > 0) {
                createNotification({
                    user_id: profileData.user_id,
                    title: notifTitle,
                    message: notifMessage,
                    read: false,
                })
                    .then(() => listMyNotifications().catch(() => null))
                    .catch(() => {
                        // In-app notification above still provides immediate feedback.
                    });
            }

            sendLocalTestNotification(notifTitle, notifMessage).catch(() => {
                // Creation should not fail due to local notification issues.
            });

            router.back();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create task.";
            Alert.alert("Create Task Failed", message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <SafeAreaView>
                        <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Pressable onPress={() => router.back()}>
                                <Feather name="arrow-left" size={24} color="black" />
                            </Pressable>
                            <View>
                                <Text style={styles.headerTitle}>Create Task</Text>
                                <Text style={styles.subHeader}>Add a new caregiving task</Text>
                            </View>
                        </View>

                        {/* Form Container */}
                        <View style={styles.formContainer}>
                            <View style={styles.formContent}>
                                <Text style={styles.formTitle}>Task Details</Text>
                                <Text style={styles.inputTitle}>Care Space *</Text>
                                <Menu
                                    visible={menuVisible1}
                                    onDismiss={() => setMenuVisible1(false)}
                                    anchor={
                                    <Pressable onPress={() => {
                                        if (isScopedFromCareSpaceSettings) {
                                            return;
                                        }
                                        setMenuVisible1(true);
                                    }}>
                                        <TextInput
                                            // label="Care Space"
                                            value={careSpaceType}
                                            mode="outlined"
                                            editable={false}
                                            pointerEvents="none"
                                            textColor={careSpaceType === "Select Care Space" ? "#7a7979" : "#000000"}
                                            right={<TextInput.Icon icon="menu-down" />}
                                            outlineStyle={{ borderRadius: 16, borderWidth: 1.5 }}
                                            style={styles.inputField}
                                        />
                                    </Pressable>
                                    }
                                    contentStyle={styles.dropdownContent}
                                    style={styles.dropdown}
                                >
                                    {(isScopedFromCareSpaceSettings
                                        ? manageableCareSpaces.filter((careSpace) => {
                                            if (!parsedRouteCareSpaceId) return false;
                                            return resolveCareSpaceNumericId(careSpace.id) === parsedRouteCareSpaceId;
                                        })
                                        : manageableCareSpaces
                                    ).map((careSpace) => {
                                        const numericId = resolveCareSpaceNumericId(careSpace.id);

                                        if (!Number.isInteger(numericId) || numericId <= 0) {
                                            return null;
                                        }

                                        return (
                                            <Menu.Item
                                                key={`care-space-menu-${careSpace.id}`}
                                                onPress={() => {
                                                    setCareSpace(careSpace.title);
                                                    setSelectedCareSpaceId(numericId);
                                                    setApplyToAll(false);
                                                    setDependent("Select Dependent");
                                                    setSelectedDependentUserId(null);
                                                    setMenuVisible1(false);
                                                }}
                                                title={careSpace.title}
                                                titleStyle={styles.dropdownItemText}
                                            />
                                        );
                                    })}
                                </Menu>

                                <Text style={styles.inputTitle}>Dependent *</Text>
                                <Menu
                                    visible={menuVisible2}
                                    onDismiss={() => setMenuVisible2(false)}
                                    anchor={
                                    <Pressable onPress={() => setMenuVisible2(true)}>
                                        <TextInput
                                            // label="Dependent"
                                            value={dependentType}
                                            mode="outlined"
                                            editable={false}
                                            pointerEvents="none"
                                            textColor={dependentType === "Select Dependent" ? "#7a7979" : "#000000"}
                                            right={<TextInput.Icon icon="menu-down" />}
                                            outlineStyle={{ borderRadius: 16, borderWidth: 1.5 }}
                                            style={styles.inputField}
                                        />
                                    </Pressable>
                                    }
                                    contentStyle={styles.dropdownContent}
                                    style={styles.dropdown}
                                >
                                    {availableDependents.map((dependent) => {
                                        return (
                                            <Menu.Item
                                                key={`dependent-menu-${dependent.key}`}
                                                onPress={() => {
                                                    setDependent(dependent.name);
                                                    setSelectedDependentUserId(dependent.userId);
                                                    setMenuVisible2(false);
                                                }}
                                                title={dependent.name}
                                                titleStyle={styles.dropdownItemText}
                                            />
                                        );
                                    })}
                                </Menu>
                                <View style={styles.applyAllRadio}>
                                    <Checkbox
                                        status={applyToAll ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            const nextValue = !applyToAll;
                                            setApplyToAll(nextValue);

                                            if (nextValue) {
                                                setDependent("All Dependents");
                                                setSelectedDependentUserId(null);
                                            } else {
                                                setDependent("Select Dependent");
                                                setSelectedDependentUserId(null);
                                            }
                                        }}
                                        color="#7C6FDC"
                                    />
                                    <Text style={styles.inputSubTitle}>
                                        {isScopedFromCareSpaceSettings
                                            ? "Apply to all dependents in this care space"
                                            : "Apply to all dependents"}
                                    </Text>
                                </View>

                                {/* Task Input */}
                                <Text style={styles.inputTitle}>Task Title *</Text>
                                <TextInput 
                                    // label="Task Title" 
                                    autoCapitalize="none" keyboardType="default" placeholder="Enter task title" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]} value={title} onChangeText={setTitle}/>

                                {/* Task Description */}
                                <Text style={styles.inputTitle}>Task Description</Text>
                                <TextInput 
                                    // label="Task Description" 
                                    autoCapitalize="none" 
                                    keyboardType="default" 
                                    placeholder="Enter task description" 
                                    mode="outlined"  
                                    activeOutlineColor="#6d28d9" 
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} 
                                    multiline={true}
                                    numberOfLines={4}
                                    style={[styles.inputFieldLarge]}
                                    value={description}
                                    onChangeText={setDescription}
                                />

                                <Text style={styles.inputTitle}>Priority *</Text>
                                <Menu
                                    visible={priorityMenuVisible}
                                    onDismiss={() => setPriorityMenuVisible(false)}
                                    anchor={
                                    <Pressable onPress={() => setPriorityMenuVisible(true)}>
                                        <TextInput
                                            value={priority}
                                            mode="outlined"
                                            editable={false}
                                            pointerEvents="none"
                                            right={<TextInput.Icon icon="menu-down" />}
                                            outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                            style={styles.inputField}
                                        />
                                    </Pressable>
                                    }
                                    contentStyle={styles.dropdownContent}
                                    style={styles.dropdown}
                                >
                                    <Menu.Item onPress={() => { setPriority("Low"); setPriorityMenuVisible(false); }} title="Low" titleStyle={styles.dropdownItemText} />
                                    <Menu.Item onPress={() => { setPriority("Medium"); setPriorityMenuVisible(false); }} title="Medium" titleStyle={styles.dropdownItemText} />
                                    <Menu.Item onPress={() => { setPriority("High"); setPriorityMenuVisible(false); }} title="High" titleStyle={styles.dropdownItemText} />
                                </Menu>

                                {/* Date and Time */}
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        {/* Due Date */}
                                        <Text style={styles.inputTitle}>Due Date *</Text>
                                        <View style={styles.datePickerContainer}>
                                            {Platform.OS !== 'web' ? (
                                                <Pressable onPress={() => setShowDatePicker(true)}>
                                                    <TextInput
                                                        value={dateInputValue}
                                                        mode="outlined"
                                                        editable={false}
                                                        pointerEvents="none"
                                                        placeholder="YYYY/MM/DD"
                                                        right={<TextInput.Icon icon="calendar" />}
                                                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                        style={styles.inputField}
                                                    />
                                                </Pressable>
                                            ) : (
                                                <TextInput
                                                    value={dateInputValue}
                                                    onChangeText={handleManualDateInput}
                                                    mode="outlined"
                                                    editable={true}
                                                    placeholder="YYYY/MM/DD"
                                                    right={<TextInput.Icon icon="calendar" />}
                                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                    style={styles.inputField}
                                                />
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        {/* Due Time */}
                                        <Text style={styles.inputTitle}>Time</Text>
                                        <View style={styles.datePickerContainer}>
                                            {Platform.OS !== 'web' ? (
                                                <Pressable onPress={() => setShowTimePicker(true)}>
                                                    <TextInput
                                                        value={dueTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        mode="outlined"
                                                        editable={false}
                                                        pointerEvents="none"
                                                        placeholder="HH:MM"
                                                        right={<TextInput.Icon icon="clock" />}
                                                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                        style={styles.inputField}
                                                    />
                                                </Pressable>
                                            ) : (
                                                <TextInput
                                                    value={timeInputValue}
                                                    onChangeText={handleManualTimeInput}
                                                    mode="outlined"
                                                    editable={true}
                                                    placeholder="HH:MM"
                                                    right={<TextInput.Icon icon="clock" />}
                                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                    style={styles.inputField}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* Recurring Task */}
                                <View style={styles.divider}>
                                    <View style={styles.recurringTaskRow}>
                                        <View style={styles.recurringTaskWrapper}>
                                            <Text style={styles.inputTitle2}>Recurring Task</Text>
                                            <Text style={styles.inputSubTitle2}>Repeat this task automatically</Text>
                                        </View>
                                        <Switch
                                            value={isRecurring}
                                            onValueChange={(nextValue) => {
                                                setIsRecurring(nextValue);

                                                if (!nextValue) {
                                                    setRecurringPattern("Select Recurring Pattern");
                                                    setSelectedRecurringDays([]);
                                                }
                                            }}
                                            color="#7C6FDC"
                                            style={styles.toggle}
                                        />
                                    </View>

                                    {/* Dropdown for the pattern */}
                                    <Menu
                                        visible={recurringPatternMenuVisible}
                                        onDismiss={() => setRecurringPatternMenuVisible(false)}
                                        anchor={
                                        <Pressable onPress={() => setRecurringPatternMenuVisible(true)}>
                                            <TextInput
                                                value={recurringPattern}
                                                mode="outlined"
                                                editable={false}
                                                pointerEvents="none"
                                                right={<TextInput.Icon icon="menu-down" />}
                                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                style={styles.inputField}
                                            />
                                        </Pressable>
                                        }
                                        contentStyle={styles.dropdownContent}
                                        style={styles.dropdown}
                                        >
                                        <Menu.Item
                                            onPress={() => {
                                                setRecurringPattern("Daily");
                                                setSelectedRecurringDays([]);
                                                setRecurringPatternMenuVisible(false);
                                            }}
                                            title="Daily"
                                            titleStyle={styles.dropdownItemText}
                                        />
                                        <Menu.Item
                                            onPress={() => {
                                                setRecurringPattern("Weekly");
                                                setRecurringPatternMenuVisible(false);
                                            }}
                                            title="Weekly"
                                            titleStyle={styles.dropdownItemText}
                                        />
                                        <Menu.Item
                                            onPress={() => {
                                                setRecurringPattern("Custom (Specific Days)");
                                                setRecurringPatternMenuVisible(false);
                                            }}
                                            title="Custom (Specific Days)"
                                            titleStyle={styles.dropdownItemText}
                                        />
                                    </Menu>

                                    {requiresSpecificDays && (
                                        <View style={styles.daysSelectionContainer}>
                                            <Text style={styles.inputTitle}>Select Days</Text>
                                            <View style={styles.daysRow}>
                                                <SunButton
                                                    selected={selectedRecurringDays.includes(0)}
                                                    onPress={() => toggleRecurringDay(0)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <MonButton
                                                    selected={selectedRecurringDays.includes(1)}
                                                    onPress={() => toggleRecurringDay(1)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <TueButton
                                                    selected={selectedRecurringDays.includes(2)}
                                                    onPress={() => toggleRecurringDay(2)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <WedButton
                                                    selected={selectedRecurringDays.includes(3)}
                                                    onPress={() => toggleRecurringDay(3)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <ThuButton
                                                    selected={selectedRecurringDays.includes(4)}
                                                    onPress={() => toggleRecurringDay(4)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <FriButton
                                                    selected={selectedRecurringDays.includes(5)}
                                                    onPress={() => toggleRecurringDay(5)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                                <SatButton
                                                    selected={selectedRecurringDays.includes(6)}
                                                    onPress={() => toggleRecurringDay(6)}
                                                    style={styles.dayButtonSpacing}
                                                />
                                            </View>
                                            {selectedRecurringDays.length > 0 && (
                                                <Text style={styles.daysPreviewText}>
                                                    Task will repeat on: {formatRecurringDaysLabel(selectedRecurringDays)}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {/* This is for the reminder section */}
                                <View style={styles.recurringTaskRow}>
                                    <View style={styles.recurringTaskWrapper}>
                                        <Text style={styles.inputTitle2}>Reminder</Text>
                                        <Text style={styles.inputSubTitle2}>Get notified before task is due</Text>
                                    </View>
                                    <Switch
                                        value={isReminderEnabled}
                                        onValueChange={setIsReminderEnabled}
                                        color="#7C6FDC"
                                        style={styles.toggle}
                                    />
                                </View>
                                <View style={styles.datePickerContainer}>
                                    {Platform.OS !== 'web' ? (
                                        <Pressable onPress={() => setShowReminderTimePicker(true)}>
                                            <TextInput
                                                value={reminderTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                mode="outlined"
                                                editable={false}
                                                pointerEvents="none"
                                                placeholder="HH:MM"
                                                right={<TextInput.Icon icon="clock" />}
                                                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                style={styles.inputField}
                                            />
                                        </Pressable>
                                    ) : (
                                        <TextInput
                                            value={reminderTimeInputValue}
                                            onChangeText={handleManualReminderTimeInput}
                                            mode="outlined"
                                            editable={true}
                                            placeholder="HH:MM"
                                            right={<TextInput.Icon icon="clock" />}
                                            outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                            style={styles.inputField}
                                        />
                                    )}
                                </View>

                                {/* For the buttons */}
                                <View style={styles.buttonContainer}>
                                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={[styles.createButton, (!isFormValid || submitting) && styles.createButtonDisabled]} onPress={handleSaveTask} disabled={!isFormValid || submitting}>
                                        <Text style={styles.createButtonText}>{submitting ? "Creating..." : "Create Task"}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Date Picker Modal */}
            <CustomDatePickerModal
                visible={showDatePicker}
                date={dueDate}
                onDateChange={handleDateChange}
                onClose={handleCloseDatePicker}
            />

            {/* Custom Time Picker Modal */}
            <CustomTimePickerModal
                visible={showTimePicker}
                time={dueTime}
                onTimeChange={handleTimeChange}
                onClose={handleCloseTimePicker}
            />

            <CustomTimePickerModal
                visible={showReminderTimePicker}
                time={reminderTime}
                onTimeChange={handleReminderTimeChange}
                onClose={handleCloseReminderTimePicker}
            />

            {/* Reminder trigger modal (only when reminder is enabled and time is in the future) */}
            {isReminderEnabled && !isInPast() && (
                <ReminderModal
                    dueDate={dueDate}
                    dueTime={reminderTime}
                    title="Task Reminder"
                    message={`${title || "Task"} is due now.`}
                    onClose={() => {}}
                    checkIntervalMs={1000}
                />
            )}
        </LinearGradient>
    );
}
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingTop: 50,
    },

    gradient: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    headerContainer: {
        paddingTop: 0,
        paddingBottom: 0,
        padding: 15,
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

    //Form container
    formContainer: {
        padding: 20,
        borderRadius: 14,
        marginTop: 5,
    },

    formContent: {
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        shadowColor: "#000",
    },

    formTitle: {
        padding: 10,
        paddingLeft: 0,
        paddingTop: 0,
        fontSize: 16,
        fontWeight: "bold",
        color: "#000000",
    },

    input: {
        marginTop: 0,
    },

    inputTitle: {
        padding: 10,
        paddingLeft: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#000000",
    },

    inputTitle2: {
        padding: 10,
        paddingBottom: 0,
        paddingLeft: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#000000",
    },

    inputSubTitle: {
        padding: 10,
        paddingLeft: 0,
        fontSize: 14,
        // fontWeight: 600,
        color: "#000000",
    },

    inputSubTitle2: {
        padding: 0,
        fontSize: 14,
        // fontWeight: 600,
        color: "#6d6d6d",
    },

    inputField: {
        backgroundColor: "#ffffff",
        height: 45,  // to adjust the input smaller or bigger
    },

    inputFieldLarge: {
        backgroundColor: "#ffffff",
        height: 120,  // Larger height for descriptions
        textAlignVertical: "top",
    },

    //Dropdown
    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "85%",
        marginLeft: -10,
        marginTop: 40,
        marginVertical: 5,
    },

    // For the second dropdown in the double dropdown row
    dropdown2: {
        padding: 12,
        borderRadius: 16,
        width: "45%",
        marginLeft: -10,
        marginTop: 40,
        marginVertical: 5,
    },

    dropdownContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
    },

    dropdownItemText: {
        color: "#000000",
    },

    inputRow: {
        flexDirection: "row",
        columnGap: 12,
    },

    inputGroup: {
        flex: 1,
    },

    // Apply to all dependents radio button
    applyAllRadio: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 0,
    },

    // recurring task section
    divider: {
        borderTopColor: "#e0e0e0",
        borderTopWidth: 1,
        width: "100%",
        marginTop: 15,
        borderBottomColor: "#e0e0e0",
        borderBottomWidth: 1,
        paddingBottom: 15,
    },
    recurringTaskRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // gap: 12,
        paddingBottom: 10,
    },

    recurringTaskWrapper: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
    },

    toggle: {
        marginTop: 10,
        height: 25,
        alignContent: "center",
        alignSelf: "center",
    },

    daysSelectionContainer: {
        marginTop: 8,
    },

    daysRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 8,
    },

    dayButtonSpacing: {
        marginRight: 8,
    },

    daysPreviewText: {
        marginTop: 10,
        color: "#6d6d6d",
        fontSize: 14,
    },

    datePickerContainer: {
        width: '100%',
    },

    // For the buttons
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 20,
    },

    cancelButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#7C6FDC",
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },

    cancelButtonText: {
        color: "#3f2f8f",
        fontSize: 15,
        fontWeight: "500",
    },

    createButton: {
        flex: 1,
        height: 44,
        borderRadius: 16,
        backgroundColor: "#7C6FDC",
        justifyContent: "center",
        alignItems: "center",
    },

    createButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },

    createButtonDisabled: {
        backgroundColor: "#c7bff1",
    },
});