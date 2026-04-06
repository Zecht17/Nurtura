import EmergencyAlert from "@/components/buttons/dependentSide/emergencyAlert";
import CompleteTaskModal from "@/components/modals/CompleteTaskModal";
import RecurringDayStatusTags, { getRecurringPatternBase } from "@/components/tags/date/recurringDayStatusTags";
import LowPriorityStatus from "@/components/tags/priority/lowPriority";
import MediumPriorityStatus from "@/components/tags/priority/mediumPriority";
import MonthlyRecurringStatus from "@/components/tags/recurring/monthly";
import WeeklyRecurringStatus from "@/components/tags/recurring/weekly";
import CompletedStatus from "@/components/tags/status/completed";
import MissedStatus from "@/components/tags/status/missed";
import { useAuth } from "@/context/AuthContext";
import { useCareSpaces } from "@/context/CareSpacesContext";
import { useDependents } from "@/context/DependentContext";
import { useTasks } from "@/context/tasksContext";
import { useUser } from "@/context/UserContext";
import { resolveDependentDisplayName, selfDependentContextFromProfile } from "@/utils/resolveDependentDisplayName";
import { parseCareSpaceNumericIdFromString } from "@/utils/resolveTaskCareSpaceId";
import { getResponsiveTokens, scaleByWidth } from "@/utils/responsive";
import { computeComputedTaskStatus, parseLocalDueDateTime } from "@/utils/taskDueDate";
import { isDependentRole } from "@/utils/userRole";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions, } from "react-native";
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

type TaskRange = "Today" | "This Week" | "This Month";

/** Monday 00:00:00 — Sunday 23:59:59.999 in local time, for the week containing `reference`. */
function getWeekRange(reference: Date): { start: Date; end: Date } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isDueInSelectedRange(due: Date | null, range: TaskRange, now: Date): boolean {
  if (!due) return false;
  if (range === "Today") {
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  }
  if (range === "This Week") {
    const { start, end } = getWeekRange(now);
    const t = due.getTime();
    return t >= start.getTime() && t <= end.getTime();
  }
  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth();
}

export default function Index() {
  const { width } = useWindowDimensions();
  const tokens = getResponsiveTokens(width);
  const contentMaxWidth = tokens.containerMaxWidth;
  const pageInset = tokens.pagePadding;
  const sectionInset = tokens.pagePadding;
  const headingSize = tokens.title;
  const subheadingSize = tokens.subtitle;
  const controlMinWidth = scaleByWidth(width, 120, 102, 160);
  const controlMaxWidth = scaleByWidth(width, 200, 170, 260);
  const { user } = useAuth();
  const { profileData } = useUser();

  const isDependentAccount = useMemo(
    () => isDependentRole(profileData?.role ?? user?.role),
    [profileData?.role, user?.role],
  );

  const selfDependentResolution = useMemo(() => selfDependentContextFromProfile(profileData), [profileData]);

  const [range, setRange] = useState<TaskRange>("Today");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const { dependents } = useDependents();
  const { careSpaces } = useCareSpaces();
  const { tasks, completeTaskAsUser, listMyTasks, listCreatedByMeTasks } = useTasks();
  StatusBar.setBarStyle("dark-content");

  /** Only tasks in care spaces the user belongs to (avoids stale rows from another account/session). */
  const tasksVisibleOnHome = useMemo(() => {
    const numericIds = careSpaces
      .map((cs) => parseCareSpaceNumericIdFromString(cs.id))
      .filter((n): n is number => typeof n === "number" && n > 0);
    if (numericIds.length === 0) return tasks;
    return tasks.filter((task) => {
      if (task.careSpaceId == null) return true;
      return numericIds.includes(task.careSpaceId);
    });
  }, [tasks, careSpaces]);

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

  const filteredAndSortedTasks = useMemo(() => {
    const now = new Date(nowMs);
    const decorated = tasksVisibleOnHome.map((task) => {
      const due = parseLocalDueDateTime(task.dueDate, task.dueTime);
      const computedStatus = computeComputedTaskStatus(task.status, due, nowMs);
      return { ...task, computedStatus };
    });

    const inRange = decorated.filter((task) => {
      const due = parseLocalDueDateTime(task.dueDate, task.dueTime);
      return isDueInSelectedRange(due, range, now);
    });

    inRange.sort((a, b) => {
      const ta = parseLocalDueDateTime(a.dueDate, a.dueTime);
      const tb = parseLocalDueDateTime(b.dueDate, b.dueTime);
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return ta.getTime() - tb.getTime();
    });

    return inRange;
  }, [tasksVisibleOnHome, nowMs, range]);

  const dashboardFilter =
    range === "Today" ? "today" : range === "This Week" ? "week" : "month";

  const overviewSubheader =
    range === "Today"
      ? "Here's your caregiving overview for today."
      : range === "This Week"
        ? "Here's your caregiving overview for this week."
        : "Here's your caregiving overview for this month.";

  const emptyRangeMessage =
    range === "Today"
      ? "No tasks due today."
      : range === "This Week"
        ? "No tasks due this week."
        : "No tasks due this month.";

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
          const timePart = parsed.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return `${year}-${month}-${day} ${timePart}`;
        })()
      : [dueDate, dueTime?.toUpperCase()].filter(Boolean).join(" ");

    return (
      <View style={styles.datePill}>
        <Text style={styles.datePillText} allowFontScaling={false} numberOfLines={1}>{label}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}>
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isDependentAccount && styles.scrollContentDependent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView>
        <View style={[styles.screenConstraint, { maxWidth: contentMaxWidth }] }>
          {/* <View style={styles.view}>
          <Link href="/login">Go to Login </Link>
          <Link href="/signup">Go to Sign Up</Link>
          </View> */}

          {/* This is the Greeting Header */}
          <View style={[styles.headerContainer, { padding: pageInset }] }>
            <Text style={[styles.headerTitle, { fontSize: headingSize }]} allowFontScaling={false}>Welcome Back, {user?.username ?? "User"}!</Text>
            <Text style={[styles.subHeader, { fontSize: subheadingSize }]} allowFontScaling={false}>{overviewSubheader}</Text>
          </View>

          {/* Week summary dashboard — all roles */}
          <View
            style={[
              styles.summaryContainer,
              { padding: sectionInset },
              isDependentAccount && styles.summaryContainerBeforeEmergency,
            ]}
          >
            <WeekSummaryCard filter={dashboardFilter} nowMs={nowMs} tasks={tasksVisibleOnHome} />
          </View>

          {/* Dependent: Emergency Alert. Family member / caregiver: Today + Dependents snapshot cards. */}
          {!isDependentAccount ? (
            <View style={[styles.cardsRow, { paddingHorizontal: sectionInset }]}> 
              <TodayTasksCard nowMs={nowMs} tasks={tasksVisibleOnHome} />
              <DependentsCard />
            </View>
          ) : (
            <View style={[styles.dependentEmergencyWrap, { paddingHorizontal: sectionInset }]}> 
              <EmergencyAlert />
            </View>
          )}

          {/* This is for the  Task row, dropdown, and add button */}
          <View style={[styles.taskOptions, { paddingHorizontal: sectionInset }]}> 
            <Text style={[styles.taskOptionsText, { fontSize: headingSize }]} allowFontScaling={false}>Tasks</Text>
            <View style={styles.tasksHeaderRight}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchorPosition="bottom"
                anchor={
                  <Pressable onPress={() => setMenuVisible(true)} style={styles.rangeMenuAnchor}>
                    <TextInput
                      value={range}
                      mode="outlined"
                      editable={false}
                      pointerEvents="none"
                      right={<TextInput.Icon icon="menu-down" />}
                      outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                      style={[styles.inputField, { minWidth: controlMinWidth, maxWidth: controlMaxWidth }]}
                      contentStyle={styles.inputFieldContent}
                    />
                  </Pressable>
                }
                contentStyle={styles.dropdownContent}
                style={styles.dropdownMenuWrapper}
              >
                <Menu.Item onPress={() => { setRange("Today"); setMenuVisible(false); }} title="Today" titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]} />
                <Menu.Item onPress={() => { setRange("This Week"); setMenuVisible(false); }} title="This Week" titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]} />
                <Menu.Item onPress={() => { setRange("This Month"); setMenuVisible(false); }} title="This Month" titleStyle={[styles.dropdownItemText, { fontSize: tokens.menuText }]} />
              </Menu>
              {!isDependentAccount && <AddTaskShort />}
            </View>
          </View>
          
          {/* This is the Task Card */}
          <View style={[styles.taskCardContainer, { paddingHorizontal: sectionInset }]}> 
            {tasksVisibleOnHome.length === 0 ? (
              <NoPendingTask />
            ) : filteredAndSortedTasks.length === 0 ? (
              <NoPendingTask
                title={emptyRangeMessage}
                subtitle={
                  isDependentAccount
                    ? "Try another range."
                    : "Try another range or add a task with a due date."
                }
              />
            ) : (
              filteredAndSortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  value={task.id}
                  selectedTask={selectedTask}
                  onSelect={setSelectedTask}
                  readOnly={isDependentAccount}
                  isCompleted={task.computedStatus === "completed"}
                  onRadioPress={
                    isDependentAccount || task.computedStatus === "completed"
                      ? undefined
                      : () => setPendingCompleteId(task.id)
                  }
                  title={task.title}
                  dependent={resolveDependentDisplayName(task, dependents, selfDependentResolution)}
                  description={task.description}
                  statusTags={
                    <>
                      {statusTagByStatus[task.computedStatus]}
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
                  onPress={() =>
                    router.push({
                      pathname: "/taskDetails",
                      params: {
                        id: task.id,
                        careSpaceId: task.careSpaceId ? String(task.careSpaceId) : undefined,
                      },
                    })
                  }
                />
              ))
            )}
          </View>
          
          {/* Quick Actions */}
          <Pressable>
            <View style={[styles.taskOptions, { paddingHorizontal: sectionInset }]}> 
              <Text style={[styles.taskOptionsText, { fontSize: headingSize }]} allowFontScaling={false}>Quick Actions</Text>
            </View>
          </Pressable>
          
          <Pressable>
            <View style={[styles.quickActionRow, { paddingHorizontal: sectionInset }]}> 
              <CareSpaceButton />
              <AiAssistantButton />
            </View>
          </Pressable>

        </View>
      </SafeAreaView>
    </ScrollView>
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
          await Promise.all([
            listMyTasks({ dateFilter: "all", status: "pending" }),
            listCreatedByMeTasks({ dateFilter: "all", status: "pending" }),
            listMyTasks({ dateFilter: "all", status: "completed" }),
            listCreatedByMeTasks({ dateFilter: "all", status: "completed" }),
          ]);
          setPendingCompleteId(null);
        } catch (error) {
          Alert.alert("Complete failed", error instanceof Error ? error.message : "Unable to complete task.");
        } finally {
          setCompleting(false);
        }
      }}
      onCancel={() => setPendingCompleteId(null)}
    />
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },

  /** Dependent home has fewer cards; avoid vertically centering content (large gap under header). */
  scrollContentDependent: {
    justifyContent: "flex-start",
  },

  view: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  screenConstraint: {
    width: "100%",
    alignSelf: "center",
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

  /** Dependent: less padding below week summary so gap to Emergency Alert matches card→card rhythm (~16–20px). */
  summaryContainerBeforeEmergency: {
    paddingBottom: 8,
  },

  dependentEmergencyWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
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
    gap: 12,
  },

  tasksHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 8,
  },

  taskOptionsText: {
    flexShrink: 0,
    fontWeight: "bold",
    fontSize: 24,
    color: "#000000",
  },

  inputField: {
    minWidth: 120,
    maxWidth: 200,
    height: 40,
    backgroundColor: "#ffffff",
    fontSize: 14,
  },

  inputFieldContent: {
    paddingVertical: 4,
    fontSize: 14,
  },

  /** Menu root: no flex grow — keeps pill next to "Tasks" instead of stretching across the row */
  dropdownMenuWrapper: {
    alignSelf: "center",
  },

  dropdownContent: {
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },

  dropdownItemText: {
    color: "#111827",
  },

  rangeMenuAnchor: {
    flexShrink: 0,
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
    fontSize: 12,
  },

});