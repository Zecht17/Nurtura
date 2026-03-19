import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Checkbox, Menu, Switch, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDatePickerModal from '../components/modals/CustomDatePickerModal';
import CustomTimePickerModal from '../components/modals/CustomTimePickerModal';
import ReminderModal from "../components/modals/reminderModal";
import { useTasks } from "../context/TasksContext";

export default function AddTaskScreen() {
    const router = useRouter();
    const { addTask } = useTasks();
    StatusBar.setBarStyle("dark-content");
    // For Dropdowns
    const [menuVisible1, setMenuVisible1] = useState(false);
    const [menuVisible2, setMenuVisible2] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
    const [recurringPatternMenuVisible, setRecurringPatternMenuVisible] = useState(false);
    const [careSpaceType, setCareSpace] = useState("Select Care Space");
    const [dependentType, setDependent] = useState("Select Dependent");
    const [category, setCategory] = useState("Select Category");
    const [priority, setPriority] = useState("Select Priority");
    const [recurringPattern, setRecurringPattern] = useState("Select Recurring Pattern");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [applyToAll, setApplyToAll] = useState(false);
    // For Switches
    const [isRecurring, setIsRecurring] = useState(false);
    const [isReminderEnabled, setIsReminderEnabled] = useState(false);
    // For Date and Time Pickers
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const formatDateYMD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };
    const [dateInputValue, setDateInputValue] = useState(formatDateYMD(new Date()));
    const [dueTime, setDueTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timeInputValue, setTimeInputValue] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));

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

    const isInPast = () => {
        const now = new Date();
        const datePart = dueDate;
        const timePart = dueTime;
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

    const isFormValid = Boolean(
        title.trim() &&
        dependentType !== "Select Dependent" &&
        category !== "Select Category" &&
        priority !== "Select Priority" &&
        dateInputValue.trim() &&
        !isInPast()
    );

    const handleSaveTask = () => {
        if (!isFormValid) return;

        const recurringValue = isRecurring && recurringPattern !== "Select Recurring Pattern"
            ? recurringPattern
            : null;

        addTask({
            id: Date.now().toString(),
            title: title.trim(),
            dependent: dependentType,
            description: description.trim(),
            status: "pending",
            dueDate: formatDateYMD(dueDate),
            dueTime: dueTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            category,
            priority,
            recurringPattern: recurringValue,
            reminderEnabled: isReminderEnabled,
        });

        router.back();
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
                                <Text style={styles.inputTitle}>Care Space (Optional)</Text>
                                <Menu
                                    visible={menuVisible1}
                                    onDismiss={() => setMenuVisible1(false)}
                                    anchor={
                                    <Pressable onPress={() => setMenuVisible1(true)}>
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
                                    <Menu.Item onPress={() => { setCareSpace("Care Space 1"); setMenuVisible1(false); }} title="Care Space 1" titleStyle={styles.dropdownItemText} />
                                    <Menu.Item onPress={() => { setCareSpace("Care Space 2"); setMenuVisible1(false); }} title="Care Space 2" titleStyle={styles.dropdownItemText} />
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
                                    <Menu.Item onPress={() => { setDependent("Jirah Denisse"); setMenuVisible2(false); }} title="Jirah Denisse" titleStyle={styles.dropdownItemText} />
                                    <Menu.Item onPress={() => { setDependent("Cryiel Alden"); setMenuVisible2(false); }} title="Cryiel Alden" titleStyle={styles.dropdownItemText} />
                                </Menu>
                                <View style={styles.applyAllRadio}>
                                    <Checkbox
                                        status={applyToAll ? 'checked' : 'unchecked'}
                                        onPress={() => setApplyToAll(!applyToAll)}
                                        color="#7C6FDC"
                                    />
                                    <Text style={styles.inputSubTitle}>Apply to all dependents</Text>
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

                                {/* Double dropdown */}
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputTitle}>Category *</Text>
                                        <Menu
                                            visible={menuVisible}
                                            onDismiss={() => setMenuVisible(false)}
                                            anchor={
                                            <Pressable onPress={() => setMenuVisible(true)}>
                                                <TextInput
                                                    value={category}
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
                                            style={styles.dropdown2}
                                        >
                                            <Menu.Item onPress={() => { setCategory("Category 1"); setMenuVisible(false); }} title="Category 1" titleStyle={styles.dropdownItemText} />
                                            <Menu.Item onPress={() => { setCategory("Category 2"); setMenuVisible(false); }} title="Category 2" titleStyle={styles.dropdownItemText} />
                                        </Menu>
                                    </View>
                                    <View style={styles.inputGroup}>
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
                                            style={styles.dropdown2}
                                        >
                                            <Menu.Item onPress={() => { setPriority("Low"); setPriorityMenuVisible(false); }} title="Low" titleStyle={styles.dropdownItemText} />
                                            <Menu.Item onPress={() => { setPriority("Medium"); setPriorityMenuVisible(false); }} title="Medium" titleStyle={styles.dropdownItemText} />
                                            <Menu.Item onPress={() => { setPriority("High"); setPriorityMenuVisible(false); }} title="High" titleStyle={styles.dropdownItemText} />
                                        </Menu>
                                    </View>
                                </View>

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
                                            onValueChange={setIsRecurring}
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
                                        <Menu.Item onPress={() => { setRecurringPattern("Daily"); setRecurringPatternMenuVisible(false); }} title="Daily" titleStyle={styles.dropdownItemText} />
                                        <Menu.Item onPress={() => { setRecurringPattern("Weekly"); setRecurringPatternMenuVisible(false); }} title="Weekly" titleStyle={styles.dropdownItemText} />
                                        <Menu.Item onPress={() => { setRecurringPattern("Monthly"); setRecurringPatternMenuVisible(false); }} title="Monthly" titleStyle={styles.dropdownItemText} />
                                    </Menu>
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

                                {/* For the buttons */}
                                <View style={styles.buttonContainer}>
                                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={[styles.createButton, !isFormValid && styles.createButtonDisabled]} onPress={handleSaveTask} disabled={!isFormValid}>
                                        <Text style={styles.createButtonText}>Create Task</Text>
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

            {/* Reminder trigger modal (only when reminder is enabled and time is in the future) */}
            {isReminderEnabled && !isInPast() && (
                <ReminderModal
                    dueDate={dueDate}
                    dueTime={dueTime}
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