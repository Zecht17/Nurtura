import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import { useTasks } from "@/context/TasksContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTaskShort from "../../components/buttons/addButton";
import AiAssistantButton from "../../components/buttons/quickActionButtons/aiAssistant";
import CareSpaceButton from "../../components/buttons/quickActionButtons/careSpace";
import DependentsCard from "../../components/cards/dependents";
import NoPendingTask from "../../components/cards/noPendingTask";
import TaskCard from "../../components/cards/taskCard";
import TodayTasksCard from "../../components/cards/todayTasks";
import WeekSummaryCard from "../../components/cards/weekSummary";
import HighPriorityStatus from "../../components/tags/priority/highPriority";
import DailyRecurringStatus from "../../components/tags/recurring/daily";
import PendingStatus from "../../components/tags/status/pending";

export default function Index() {
  const userName = "Juztine Miguel"; // TODO: Get from user context or auth

  const [range, setRange] = useState("Today");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const { tasks } = useTasks();
  StatusBar.setBarStyle("dark-content");

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // This logic if for the taskCard when a task is inserted
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

  const decoratedTasks = tasks.map((task) => {
    const due = parseDueDateTime(task.dueDate, task.dueTime);
    const computedStatus = computeComputedStatus(task.status, due);
    return { ...task, computedStatus };
  });

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
          const timePart = parsed.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return `${datePart} ${weekday} at ${timePart}`;
        })()
      : [dueDate, dueTime].filter(Boolean).join(" ");

    return (
      <View style={styles.datePill}>
        <Text style={styles.datePillText}>{label}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View>
          {/* <View style={styles.view}>
          <Link href="/login">Go to Login </Link>
          <Link href="/signup">Go to Sign Up</Link>
          </View> */}

          {/* This is the Greeting Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Welcome Back, {userName}!</Text>
            <Text style={styles.subHeader}>Here's your caregiving overview for today.</Text>
          </View>

          {/* This the Summary Components */}
          <View style={styles.summaryContainer}>
            <WeekSummaryCard />
          </View>
          
          {/* This is for the Today's Tasks and Dependents */}
          <View style={styles.cardsRow}>
            <TodayTasksCard />
            <DependentsCard />
          </View>

          {/* This is for the  Task row, dropdown, and add button */}
          <View style={styles.taskOptions}>
            <Text style={styles.taskOptionsText}>Tasks</Text>
            <View style={styles.taskOptionButtons}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Pressable onPress={() => setMenuVisible(true)}>
                    <TextInput
                      value={range}
                      mode="outlined"
                      editable={false}
                      pointerEvents="none"
                      right={<TextInput.Icon icon="menu-down" />}
                      outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                      style={styles.inputField}
                    />
                  </Pressable>
                }
                contentStyle={styles.dropdownContent}
                style={styles.dropdown}
              >
                <Menu.Item onPress={() => { setRange("Today"); setMenuVisible(false); }} title="Today" titleStyle={styles.dropdownItemText} />
                <Menu.Item onPress={() => { setRange("Week"); setMenuVisible(false); }} title="This Week" titleStyle={styles.dropdownItemText} />
                <Menu.Item onPress={() => { setRange("Month"); setMenuVisible(false); }} title="This Month" titleStyle={styles.dropdownItemText} />
              </Menu>
              
              <AddTaskShort />

            </View>
          </View>
          
          {/* This is the Task Card */}
          <View style={styles.taskCardContainer}>
            {decoratedTasks.length === 0 ? (
              <NoPendingTask />
            ) : (
              decoratedTasks.map((task) => (
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
              ))
            )}
          </View>
          
          {/* Quick Actions */}
          <Pressable>
            <View style={styles.taskOptions}>
              <Text style={styles.taskOptionsText}>Quick Actions</Text>
            </View>
          </Pressable>
          
          <Pressable>
            <View style={styles.quickActionRow}>
              <CareSpaceButton />
              <AiAssistantButton />
            </View>
          </Pressable>

        </View>
      </SafeAreaView>
    </ScrollView>
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },

  view: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  headerContainer: {
    paddingTop: 0,
    padding: 15,
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

  summaryContainer: {
    marginTop: 0,
    padding: 20,
    borderRadius: 24,
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  taskOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  taskOptionsText: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#000000",
  },

  inputField: {
    width: 100,
    height: 35,
    backgroundColor: "#ffffff",
  },

  dropdown: {
    padding: 12,
    borderRadius: 16,
    width: "35%",
    marginTop: 30,
    marginHorizontal: -20,
  },

  dropdownContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },

  dropdownItemText: {
    color: "#111827",
  },

  taskOptionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

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

  quickActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 12,
    paddingHorizontal: 15,
    marginBottom: 0,
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
    fontSize: 14,
  },

});