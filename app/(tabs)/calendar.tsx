import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import AddTaskButton from "@/components/buttons/addTask";
import TaskCard from "@/components/cards/taskCard";
import DailyRecurringStatus from "@/components/tags/recurring/daily";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import HighPriorityStatus from "@/components/tags/priority/highPriority";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import PendingStatus from "@/components/tags/status/pending";
import { useTasks } from "@/context/TasksContext";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";


export default function CalendarScreen() {
    const { tasks } = useTasks();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

    // This is  for the selected date label
    const selectedDateLabel = useMemo(() => {
        const d = new Date(selectedDate);
        return isNaN(d.getTime())
            ? ""
            : d.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            });
    }, [selectedDate]);

    // This is for the task card
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

    // This is for the date tag in the task card
    const renderDateTag = (dueDate?: string, dueTime?: string) => {
        if (!dueDate && !dueTime) return null;
        const label = [dueDate, dueTime].filter(Boolean).join(" ");
        return (
            <View style={styles.datePill}>
                <Text style={styles.datePillText}>{label}</Text>
            </View>
        );
    };

    // This is so it filter tasks based on selected date
    const selectedLocaleDate = useMemo(() => {
        const d = new Date(selectedDate);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString();
    }, [selectedDate]);

    const filteredTasks = useMemo(() => {
        if (!selectedLocaleDate) return [];
        return tasks.filter((task) => task.dueDate === selectedLocaleDate);
    }, [tasks, selectedLocaleDate]);

    // Build markedDates with dots for dates that have tasks
    const markedDates = useMemo(() => {
        const dotsByDate: Record<string, { marked?: boolean; dots?: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};

        tasks.forEach((task) => {
            if (!task.dueDate) return;
            // Expect task.dueDate to be locale string; convert to ISO-like yyyy-mm-dd for the calendar key
            const parsed = new Date(task.dueDate);
            if (isNaN(parsed.getTime())) return;
            const key = parsed.toISOString().slice(0, 10);
            if (!dotsByDate[key]) dotsByDate[key] = { dots: [], marked: true };
            dotsByDate[key].dots?.push({ key: task.id, color: "#7C6FDC" });
        });

        // Ensure selected date stays selected with the existing color
        const selectedKey = selectedDate;
        if (!dotsByDate[selectedKey]) dotsByDate[selectedKey] = {};
        dotsByDate[selectedKey].selected = true;
        dotsByDate[selectedKey].selectedColor = "#7C6FDC";

        return dotsByDate;
    }, [tasks, selectedDate]);

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <View>
                                <Text style={styles.headerTitle}>Calendar</Text>
                                <Text style={styles.subHeader}>View Scheduled Task</Text>
                            </View>
                            <AddTaskButton />
                        </View>
                        {/* Calendar */}
                        <View style={styles.calendarContainer}>
                            <Calendar
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                markedDates={markedDates}
                                markingType="multi-dot"
                                theme={{
                                    backgroundColor: "#ffffff",
                                    calendarBackground: "#ffffff",
                                    textSectionTitleColor: "#7C6FDC",
                                    selectedDayBackgroundColor: "#7C6FDC",
                                    selectedDayTextColor: "#ffffff",
                                    todayTextColor: "#5A4DB2",
                                    dayTextColor: "#111827",
                                    textDisabledColor: "#c7c7d4",
                                    arrowColor: "#7C6FDC",
                                    monthTextColor: "#111827",
                                    textDayFontWeight: "500",
                                    textMonthFontWeight: "700",
                                    textDayHeaderFontWeight: "600",
                                    textDayFontSize: 16,
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 13,
                                }}
                            />
                        </View>

                        {/* Selected date label */}
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateTitle}>{selectedDateLabel || "Select a date"}</Text>
                        </View>

                        {/* Tasks for selected date */}
                        <View style={styles.taskCardContainer}>
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    value={task.id}
                                    selectedTask={selectedTask}
                                    onSelect={setSelectedTask}
                                    title={task.title}
                                    dependent={task.dependent}
                                    description={task.description}
                                    statusTags={
                                        <>
                                            {statusTagByStatus[task.status]}
                                            {task.priority && priorityTagByLevel[task.priority as keyof typeof priorityTagByLevel]}
                                            {task.recurringPattern && recurringTagByPattern[task.recurringPattern as keyof typeof recurringTagByPattern]}
                                        </>
                                    }
                                    dateTag={renderDateTag(task.dueDate, task.dueTime)}
                                />
                            ))}

                            {filteredTasks.length === 0 && (
                                <Text style={styles.emptyState}>No tasks scheduled for this date.</Text>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    gradient: {
        flex: 1,
    },

    calendarContainer: {
        margin: 16,
        marginBottom: 10,
        marginTop: 5,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        minHeight: 300,
    },

    calendar: {
        width: "100%",
        // height: "40%",
    },

    dateContainer: {
        padding: 10,
    },

    dateTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    emptyState: {
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingVertical: 8,
        color: "#666",
        fontSize: 14,
        fontWeight: "400",
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


    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    datePill: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },

    datePillText: {
        color: "#000000",
        fontSize: 14,
    },

    // This is for the task card container
    taskCardContainer: {
        paddingTop: 0,
        padding: 20,
        paddingBottom: 0,
        marginTop: 5,
        flexDirection: "column",
        gap: 12,
        alignContent: "center",
        justifyContent: "center",
    },
});