import AddTaskButton from "@/components/buttons/addTask";
import TaskCard from "@/components/cards/taskCard";
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
import Ionicicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CalendarScreen() {
    const router = useRouter();
    const { tasks } = useTasks();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [nowMs, setNowMs] = useState(Date.now());
    StatusBar.setBarStyle("dark-content");

    const toCalendarDateKey = (dateInput?: string) => {
        if (!dateInput) return null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            return dateInput;
        }

        if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split("/");
            return `${year}-${month}-${day}`;
        }

        const parsed = new Date(dateInput);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
        }

        const parts = dateInput.split(/[\/]/).map((p) => parseInt(p, 10));
        if (parts.length === 3) {
            const [month, day, year] = parts;
            if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
                const manual = new Date(year, month - 1, day);
                if (!isNaN(manual.getTime())) return manual.toISOString().slice(0, 10);
            }
        }

        return null;
    };

    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

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

    const parseDueDateTime = (dueDate?: string, dueTime?: string) => {
        if (!dueDate) return null;
        const timePart = dueTime && dueTime.trim().length > 0 ? dueTime : "23:59";

        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const parsedIso = new Date(`${dueDate}T${timePart}`);
            if (!isNaN(parsedIso.getTime())) return parsedIso;
        }

        const nativeParsed = new Date(`${dueDate} ${timePart}`);
        if (!isNaN(nativeParsed.getTime())) return nativeParsed;

        const parts = dueDate.split(/[\/]/).map((p) => parseInt(p, 10));
        if (parts.length === 3) {
            const [month, day, year] = parts;
            if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
                const [hoursRaw, minutesRaw] = timePart
                    .replace(/\s?(AM|PM)$/i, "")
                    .split(":")
                    .map((p) => parseInt(p, 10));
                const hasPM = /PM$/i.test(timePart);
                const hours = Number.isNaN(hoursRaw)
                    ? 23
                    : Math.min(23, hasPM && hoursRaw < 12 ? hoursRaw + 12 : hoursRaw);
                const minutes = Number.isNaN(minutesRaw) ? 59 : Math.min(59, minutesRaw);
                const manual = new Date(year, month - 1, day, hours, minutes);
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

    const decoratedTasks = useMemo(() => {
        return tasks.map((task) => {
            const due = parseDueDateTime(task.dueDate, task.dueTime);
            const computedStatus = computeComputedStatus(task.status, due);
            return { ...task, computedStatus };
        });
    }, [tasks, nowMs]);

    // This is so it filter tasks based on selected date
    const filteredTasks = useMemo(() => {
        return decoratedTasks.filter((task) => toCalendarDateKey(task.dueDate) === selectedDate);
    }, [decoratedTasks, selectedDate]);

    // Build markedDates with dots for dates that have tasks
    const markedDates = useMemo(() => {
        const dotsByDate: Record<string, { marked?: boolean; dots?: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};

        tasks.forEach((task) => {
            if (!task.dueDate) return;
            const key = toCalendarDateKey(task.dueDate);
            if (!key) return;
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
                                            {statusTagByStatus[task.computedStatus]}
                                            {task.priority && priorityTagByLevel[task.priority as keyof typeof priorityTagByLevel]}
                                            {task.recurringPattern && recurringTagByPattern[task.recurringPattern as keyof typeof recurringTagByPattern]}
                                        </>
                                    }
                                    dateTag={renderDateTag(task.dueDate, task.dueTime)}
                                    onPress={() => router.push({ pathname: "/taskDetails", params: { id: task.id } })}
                                />
                            ))}

                            {filteredTasks.length === 0 && (
                                <View style={styles.emptyCard}>
                                    <Ionicicons name="calendar" size={48} color="#8F99A7" />
                                    <Text style={styles.emptyState}>No tasks scheduled for this date.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        // padding: 10,
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
        textAlign: "center",
    },

    emptyCard: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
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