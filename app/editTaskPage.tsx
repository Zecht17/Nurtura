import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Checkbox, Menu, Switch, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDatePickerModal from "../components/modals/CustomDatePickerModal";
import CustomTimePickerModal from "../components/modals/CustomTimePickerModal";
import { useCareSpaces } from "../context/CareSpacesContext";
import { useDependents } from "../context/DependentContext";
import { Task, useTasks } from "../context/tasksContext";
import { collectAssigneeIdsFromTask } from "../utils/taskAssigneeIds";

export default function EditTaskScreen() {
    const router = useRouter();
    const { id, careSpaceId } = useLocalSearchParams<{ id?: string; careSpaceId?: string }>();
    const { tasks, updateTaskApi } = useTasks();
    const { careSpaces } = useCareSpaces();
    const { dependents } = useDependents();
    StatusBar.setBarStyle("dark-content");

    const task = useMemo(() => tasks.find((t) => t.id === id), [tasks, id]);

    const resolveCareSpaceNumericId = (careSpaceIdStr: string) => {
        const match = careSpaceIdStr.match(/(\d+)$/);
        return match ? Number.parseInt(match[1], 10) : Number.parseInt(careSpaceIdStr.replace("care-space-", ""), 10);
    };

    const selectableDependents = dependents.filter((dependent) => {
        const resolvedUserId = dependent.userId ?? dependent.dependentId;
        return typeof resolvedUserId === "number" && resolvedUserId > 0;
    });

    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
    const [recurringPatternMenuVisible, setRecurringPatternMenuVisible] = useState(false);

    const [careSpaceType, setCareSpace] = useState("Select Care Space");
    const [selectedCareSpaceId, setSelectedCareSpaceId] = useState<number | null>(null);
    const [dependentType, setDependent] = useState("Select Dependent");
    const [selectedDependentUserId, setSelectedDependentUserId] = useState<number | null>(null);
    const [priority, setPriority] = useState("Select Priority");
    const [recurringPattern, setRecurringPattern] = useState("Select Recurring Pattern");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [applyToAll, setApplyToAll] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [isReminderEnabled, setIsReminderEnabled] = useState(false);

    const formatDateYMD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateInputValue, setDateInputValue] = useState(formatDateYMD(new Date()));
    const [dueTime, setDueTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timeInputValue, setTimeInputValue] = useState(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    const [savingTask, setSavingTask] = useState(false);

    const userEditedCareSpaceRef = useRef(false);
    const userEditedDependentRef = useRef(false);

    const parseExistingDate = (taskToParse: Task) => {
        if (!taskToParse.dueDate) return new Date();
        const d = taskToParse.dueDate.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const [y, m, day] = d.split("-").map((p) => parseInt(p, 10));
            const local = new Date(y, m - 1, day, 12, 0, 0, 0);
            return isNaN(local.getTime()) ? new Date() : local;
        }
        const combined = [taskToParse.dueDate, taskToParse.dueTime].filter(Boolean).join(" ");
        const parsed = new Date(combined);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const parseExistingTime = (taskToParse: Task, fallbackDate: Date) => {
        if (!taskToParse.dueTime) return fallbackDate;
        const d = taskToParse.dueDate?.trim() ?? "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const withSpace = new Date(`${d} ${taskToParse.dueTime}`);
            if (!isNaN(withSpace.getTime())) return withSpace;
        }
        const parsed = new Date(`${d} ${taskToParse.dueTime}`);
        return isNaN(parsed.getTime()) ? fallbackDate : parsed;
    };

    useEffect(() => {
        if (!task) return;

        userEditedCareSpaceRef.current = false;
        userEditedDependentRef.current = false;

        const parsedDate = parseExistingDate(task);
        const parsedTime = parseExistingTime(task, parsedDate);

        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "Select Priority");
        setRecurringPattern(task.recurringPattern || "Select Recurring Pattern");
        setIsRecurring(Boolean(task.recurringPattern && task.recurringPattern !== "Select Recurring Pattern"));
        setIsReminderEnabled(Boolean(task.reminderEnabled));

        const allDepsLabel = task.dependent?.trim().toLowerCase() === "all dependents";
        if (allDepsLabel) {
            setApplyToAll(true);
            setDependent("All Dependents");
            setSelectedDependentUserId(null);
        } else {
            setApplyToAll(false);
            const assigneeIds = collectAssigneeIdsFromTask(task);
            const uid = assigneeIds[0];
            const depLabel = task.dependent?.trim() ?? "";
            const isPlaceholderDep = !depLabel || depLabel.toLowerCase() === "assigned member";

            if (typeof uid === "number" && uid > 0) {
                setSelectedDependentUserId(uid);
                const match = selectableDependents.find((dep) => (dep.userId ?? dep.dependentId) === uid);
                if (match) {
                    setDependent(match.name);
                } else if (!isPlaceholderDep) {
                    setDependent(depLabel);
                } else {
                    setDependent("Select Dependent");
                }
            } else {
                setSelectedDependentUserId(null);
                setDependent(isPlaceholderDep ? "Select Dependent" : depLabel);
            }
        }

        if (typeof task.careSpaceId === "number" && task.careSpaceId > 0) {
            setSelectedCareSpaceId(task.careSpaceId);
            const match = careSpaces.find((cs) => resolveCareSpaceNumericId(cs.id) === task.careSpaceId);
            setCareSpace(match?.title ?? "Select Care Space");
        } else {
            setSelectedCareSpaceId(null);
            setCareSpace("Select Care Space");
        }

        setDueDate(parsedDate);
        setDateInputValue(formatDateYMD(parsedDate));
        setDueTime(parsedTime);
        setTimeInputValue(parsedTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    }, [task?.id]);

    useEffect(() => {
        if (!task || userEditedCareSpaceRef.current) return;
        if (typeof task.careSpaceId !== "number" || task.careSpaceId <= 0) return;
        const match = careSpaces.find((cs) => resolveCareSpaceNumericId(cs.id) === task.careSpaceId);
        if (match) {
            setSelectedCareSpaceId(task.careSpaceId);
            setCareSpace(match.title);
        }
    }, [task?.id, task?.careSpaceId, careSpaces]);

    useEffect(() => {
        if (!task || userEditedDependentRef.current) return;

        const allDepsLabel = task.dependent?.trim().toLowerCase() === "all dependents";
        if (allDepsLabel) {
            setApplyToAll(true);
            setDependent("All Dependents");
            setSelectedDependentUserId(null);
            return;
        }

        setApplyToAll(false);
        const assigneeIds = collectAssigneeIdsFromTask(task);
        const uid = assigneeIds[0];
        const depLabel = task.dependent?.trim() ?? "";
        const isPlaceholderDep = !depLabel || depLabel.toLowerCase() === "assigned member";

        if (typeof uid === "number" && uid > 0) {
            setSelectedDependentUserId(uid);
            const match = selectableDependents.find((dep) => (dep.userId ?? dep.dependentId) === uid);
            if (match) {
                setDependent(match.name);
            } else if (!isPlaceholderDep) {
                setDependent(depLabel);
            }
        } else if (!isPlaceholderDep) {
            setDependent(depLabel);
            setSelectedDependentUserId(null);
        }
    }, [task?.id, task?.dependent, dependents]);

    const handleDateChange = (date: Date) => {
        setDueDate(date);
        setDateInputValue(formatDateYMD(date));
    };

    const handleCloseDatePicker = () => {
        setShowDatePicker(false);
    };

    const handleTimeChange = (time: Date) => {
        setDueTime(time);
        setTimeInputValue(time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };

    const handleCloseTimePicker = () => {
        setShowTimePicker(false);
    };

    const handleManualDateInput = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 8);
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
        const timeRegex = /(\d{1,2}):(\d{2})(\s?(AM|PM|am|pm))?/;
        const match = text.match(timeRegex);
        if (match) {
            let hour = parseInt(match[1], 10);
            const minute = parseInt(match[2], 10);
            const meridiem = match[4]?.toUpperCase();

            if (meridiem === "PM" && hour !== 12) hour += 12;
            if (meridiem === "AM" && hour === 12) hour = 0;

            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                const newTime = new Date(dueTime);
                newTime.setHours(hour, minute, 0);
                setDueTime(newTime);
            }
        }
    };

    const toIsoFromDateTime = (date: Date, time: Date) => {
        const merged = new Date(date);
        merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return merged.toISOString();
    };

    // Same as add task: allow saving when due date/time is already in the past (editing overdue items).
    const isFormValid = Boolean(
        title.trim() &&
        selectedCareSpaceId &&
        (applyToAll
            ? selectableDependents.length > 0
            : typeof selectedDependentUserId === "number" && selectedDependentUserId > 0) &&
        priority !== "Select Priority" &&
        dateInputValue.trim(),
    );

    const handleUpdateTask = () => {
        if (!task || !id || !isFormValid || savingTask) return;

        const numericTaskId = Number.parseInt(String(id), 10);
        if (!Number.isInteger(numericTaskId) || numericTaskId <= 0) {
            Alert.alert("Invalid task", "Unable to resolve task ID for update.");
            return;
        }

        const routeCareSpaceId = Number.parseInt(String(careSpaceId || ""), 10);
        const resolvedCareSpaceId =
            typeof selectedCareSpaceId === "number" && selectedCareSpaceId > 0
                ? selectedCareSpaceId
                : Number.isInteger(routeCareSpaceId) && routeCareSpaceId > 0
                    ? routeCareSpaceId
                    : typeof task.careSpaceId === "number" && task.careSpaceId > 0
                        ? task.careSpaceId
                        : null;

        if (!resolvedCareSpaceId) {
            Alert.alert("Care space required", "Select a care space for this task.");
            return;
        }

        const recurringValue = isRecurring && recurringPattern !== "Select Recurring Pattern"
            ? recurringPattern
            : null;

        const recurrenceType = recurringValue ? recurringValue.toLowerCase() : "none";
        const recurrenceDays =
            recurrenceType === "daily" ? 1 : recurrenceType === "weekly" ? 7 : recurrenceType === "monthly" ? 30 : 0;

        const dueDateIso = toIsoFromDateTime(dueDate, dueTime);

        const assignedUserIds = applyToAll
            ? selectableDependents
                  .map((dependent) => dependent.userId ?? dependent.dependentId)
                  .filter((id): id is number => typeof id === "number" && id > 0)
            : selectedDependentUserId && selectedDependentUserId > 0
                ? [selectedDependentUserId]
                : [];

        const normalizedPriority = priority.toLowerCase() === "high"
            ? "high"
            : priority.toLowerCase() === "medium"
                ? "medium"
                : "low";

        setSavingTask(true);

        updateTaskApi(numericTaskId, resolvedCareSpaceId, {
            updates: {
                title: title.trim(),
                description: description.trim(),
                due_date: dueDateIso,
                priority: normalizedPriority,
            },
            assigned_user_ids: assignedUserIds,
            schedule_data: [
                {
                    start_time: dueDateIso,
                    end_time: dueDateIso,
                    recurrence_type: recurrenceType as "none" | "daily" | "weekly" | "monthly",
                    recurrence_days: recurrenceDays,
                },
            ],
            localTaskOverrides: {
                title: title.trim(),
                dependent: applyToAll ? "All Dependents" : dependentType,
                description: description.trim(),
                priority,
                recurringPattern: recurringValue,
                reminderEnabled: isReminderEnabled,
                dueDate: formatDateYMD(dueDate),
                dueTime: dueTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
                careSpaceId: resolvedCareSpaceId,
                assignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : undefined,
            },
        })
            .then(() => {
                router.back();
            })
            .catch((error) => {
                Alert.alert("Update failed", error instanceof Error ? error.message : "Unable to update task.");
            })
            .finally(() => {
                setSavingTask(false);
            });
    };

    if (!task) {
        return (
            <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
                <SafeAreaView style={styles.container}>
                    <View style={[styles.container, { padding: 24 }]}> 
                        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Task not found</Text>
                        <Text style={styles.subHeader}>We could not find the task you want to edit.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

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
                                <Text style={styles.headerTitle}>Edit Task</Text>
                                <Text style={styles.subHeader}>Update caregiving task</Text>
                            </View>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.formContent}>
                                <Text style={styles.formTitle}>Task Details</Text>
                                <Text style={styles.inputTitle}>Care Space *</Text>
                                <Menu
                                    visible={menuVisible1}
                                    onDismiss={() => setMenuVisible1(false)}
                                    anchor={
                                        <Pressable onPress={() => setMenuVisible1(true)}>
                                            <TextInput
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
                                    {careSpaces.map((cs) => {
                                        const numericId = resolveCareSpaceNumericId(cs.id);
                                        if (Number.isNaN(numericId) || numericId <= 0) {
                                            return null;
                                        }
                                        return (
                                            <Menu.Item
                                                key={`care-space-menu-${cs.id}`}
                                                onPress={() => {
                                                    userEditedCareSpaceRef.current = true;
                                                    setCareSpace(cs.title);
                                                    setSelectedCareSpaceId(numericId);
                                                    setMenuVisible1(false);
                                                }}
                                                title={cs.title}
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
                                    {selectableDependents.map((dependent) => {
                                        const resolvedUserId = dependent.userId ?? dependent.dependentId;
                                        if (typeof resolvedUserId !== "number") {
                                            return null;
                                        }
                                        return (
                                            <Menu.Item
                                                key={`dependent-menu-${dependent.id}-${resolvedUserId}`}
                                                onPress={() => {
                                                    userEditedDependentRef.current = true;
                                                    setDependent(dependent.name);
                                                    setSelectedDependentUserId(resolvedUserId);
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
                                        status={applyToAll ? "checked" : "unchecked"}
                                        onPress={() => {
                                            userEditedDependentRef.current = true;
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
                                    <Text style={styles.inputSubTitle}>Apply to all dependents</Text>
                                </View>

                                <Text style={styles.inputTitle}>Task Title *</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    keyboardType="default"
                                    placeholder="Enter task title"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    style={[styles.input, styles.inputField]}
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Text style={styles.inputTitle}>Task Description</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    keyboardType="default"
                                    placeholder="Enter task description"
                                    mode="outlined"
                                    activeOutlineColor="#6d28d9"
                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                    multiline
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

                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputTitle}>Due Date *</Text>
                                        <View style={styles.datePickerContainer}>
                                            {Platform.OS !== "web" ? (
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
                                                    editable
                                                    placeholder="YYYY/MM/DD"
                                                    right={<TextInput.Icon icon="calendar" />}
                                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                    style={styles.inputField}
                                                />
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputTitle}>Time</Text>
                                        <View style={styles.datePickerContainer}>
                                            {Platform.OS !== "web" ? (
                                                <Pressable onPress={() => setShowTimePicker(true)}>
                                                    <TextInput
                                                        value={dueTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
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
                                                    editable
                                                    placeholder="HH:MM"
                                                    right={<TextInput.Icon icon="clock" />}
                                                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                                                    style={styles.inputField}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.divider}>
                                    <View style={styles.recurringTaskRow}>
                                        <View style={styles.recurringTaskWrapper}>
                                            <Text style={styles.inputTitle2}>Recurring Task</Text>
                                            <Text style={styles.inputSubTitle2}>Repeat this task automatically</Text>
                                        </View>
                                        <Switch
                                            value={isRecurring}
                                            onValueChange={setIsRecurring}
                                            color="#7C6FDC"
                                            style={styles.toggle}
                                        />
                                    </View>

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
                                        <Menu.Item onPress={() => { setRecurringPattern("Daily"); setRecurringPatternMenuVisible(false); }} title="Daily" titleStyle={styles.dropdownItemText} />
                                        <Menu.Item onPress={() => { setRecurringPattern("Weekly"); setRecurringPatternMenuVisible(false); }} title="Weekly" titleStyle={styles.dropdownItemText} />
                                        <Menu.Item onPress={() => { setRecurringPattern("Monthly"); setRecurringPatternMenuVisible(false); }} title="Monthly" titleStyle={styles.dropdownItemText} />
                                    </Menu>
                                </View>

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

                                <View style={styles.buttonContainer}>
                                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={[styles.createButton, (!isFormValid || savingTask) && styles.createButtonDisabled]} onPress={handleUpdateTask} disabled={!isFormValid || savingTask}>
                                        <Text style={styles.createButtonText}>{savingTask ? "Saving..." : "Save Changes"}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomDatePickerModal
                visible={showDatePicker}
                date={dueDate}
                onDateChange={handleDateChange}
                onClose={handleCloseDatePicker}
            />

            <CustomTimePickerModal
                visible={showTimePicker}
                time={dueTime}
                onTimeChange={handleTimeChange}
                onClose={handleCloseTimePicker}
            />
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
        paddingBottom: 20,
    },

    headerContainer: {
        paddingTop: 0,
        paddingBottom: 0,
        padding: 15,
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
        fontWeight: "600",
        color: "#000000",
    },

    inputTitle2: {
        padding: 10,
        paddingBottom: 0,
        paddingLeft: 0,
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
    },

    inputSubTitle: {
        padding: 10,
        paddingLeft: 0,
        fontSize: 14,
        color: "#000000",
    },

    inputSubTitle2: {
        padding: 0,
        fontSize: 14,
        color: "#6d6d6d",
    },

    inputField: {
        backgroundColor: "#ffffff",
        height: 45,
    },

    inputFieldLarge: {
        backgroundColor: "#ffffff",
        height: 120,
        textAlignVertical: "top",
    },

    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "85%",
        marginLeft: -10,
        marginTop: 40,
        marginVertical: 5,
    },

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

    applyAllRadio: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 0,
    },

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

    datePickerContainer: {
        width: "100%",
    },

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
