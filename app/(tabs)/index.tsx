import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import { useTasks } from "@/context/TasksContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTaskShort from "../../components/buttons/addButton";
import AiAssistantButton from "../../components/buttons/quickActionButtons/aiAssistant";
import CareSpaceButton from "../../components/buttons/quickActionButtons/careSpace";
import DependentsCard from "../../components/cards/dependents";
import TaskCard from "../../components/cards/taskCard";
import TodayTasksCard from "../../components/cards/todayTasks";
import WeekSummaryCard from "../../components/cards/weekSummary";
import DateStatus from "../../components/tags/date/dateStatus";
import HighPriorityStatus from "../../components/tags/priority/highPriority";
import DailyRecurringStatus from "../../components/tags/recurring/daily";
import PendingStatus from "../../components/tags/status/pending";

export default function Index() {
  const [range, setRange] = useState("Today");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const { tasks } = useTasks();

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

  const renderDateTag = (dueDate?: string, dueTime?: string) => {
    if (!dueDate && !dueTime) return null;
    const label = [dueDate, dueTime].filter(Boolean).join(" ");
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
            <Text style={styles.headerTitle}>Welcome Back, Juztine Miguel!</Text>
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
            <View>
              <TaskCard
                value="morning-med"
                selectedTask={selectedTask}
                onSelect={setSelectedTask}
                title="Morning Medication"
                dependent="Jirah Denisse"
                description="Give multivitamin with breakfast"
                statusTags={
                  <>
                    <PendingStatus />
                    <HighPriorityStatus />
                    <DailyRecurringStatus />
                  </>
                }
                dateTag={<DateStatus />}
              />
            </View>
            {/* This is where the next card goes */}
            <View>
              <TaskCard
                value="take-out-trash"
                selectedTask={selectedTask}
                onSelect={setSelectedTask}
                title="Take Out Trash"
                dependent="Jirah Denisse"
                description="Take out the trash in the kitchen"
                statusTags={
                  <>
                    <MissedStatus />
                    <HighPriorityStatus />
                    <WeeklyRecurringStatus />
                  </>
                }
                dateTag={<DateStatus />}
              />
            </View>
            
            {/* This is for the insert function, this will display the created task */}
            {tasks.map((task) => (
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
                onPress={() => router.push({ pathname: "/taskDetails", params: { id: task.id } })}
              />
            ))}
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
    marginTop: 6,
  },

  datePillText: {
    color: "#000000",
    fontSize: 14,
  },

});