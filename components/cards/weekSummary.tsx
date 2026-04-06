import type { Task } from "@/context/tasksContext";
import { useTasks } from "@/context/tasksContext";
import type { DashboardTimeFilter } from "@/utils/dashboardFromTasks";
import { computeDashboardMetricsFromTasks } from "@/utils/dashboardFromTasks";
import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const FILTER_LABEL: Record<DashboardTimeFilter, string> = {
  today: "Today's Summary",
  week: "This Week's Summary",
  month: "This Month's Summary",
};

type Props = {
  filter: DashboardTimeFilter;
  /** Same clock as Home task list (`computeComputedTaskStatus` / overdue). */
  nowMs: number;
  /** When set (e.g. Home scope), metrics match that list instead of all tasks in context. */
  tasks?: Task[];
};

export default function WeekSummaryCard({ filter, nowMs, tasks: tasksProp }: Props) {
  const { tasks: tasksFromContext } = useTasks();
  const tasks = tasksProp ?? tasksFromContext;
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const metrics = useMemo(
    () => computeDashboardMetricsFromTasks(tasks, filter, nowMs),
    [tasks, filter, nowMs],
  );

  const targetPct = metrics.completionPercentage;

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: targetPct,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [targetPct, progressAnim]);

  const headerText = FILTER_LABEL[filter];

  const display = useMemo(
    () => ({
      total: String(metrics.totalTasks),
      completed: String(metrics.completedTasks),
      rate: String(metrics.completionPercentage),
      progressLabel: `${metrics.completionPercentage}%`,
    }),
    [metrics],
  );

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={[styles.container, compact && styles.containerCompact]}
    >
      <View style={styles.headerRow}>
        <Octicons name="graph" size={compact ? 22 : 24} color="white" />
        <Text style={[styles.headerText, compact && styles.headerTextCompact]} allowFontScaling={false}>{headerText}</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={[styles.progressNumber, compact && styles.progressNumberCompact]} allowFontScaling={false}>{display.total}</Text>
          <Text style={[styles.progressText, compact && styles.progressTextCompact]} allowFontScaling={false}>Total Tasks</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={[styles.progressNumber, compact && styles.progressNumberCompact]} allowFontScaling={false}>{display.completed}</Text>
          <Text style={[styles.progressText, compact && styles.progressTextCompact]} allowFontScaling={false}>Completed</Text>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.rateValueRow}>
            <Text style={[styles.progressNumber, compact && styles.progressNumberCompact]} allowFontScaling={false}>{display.rate}</Text>
            <Text style={[styles.rateSuffix, compact && styles.rateSuffixCompact]} allowFontScaling={false}>%</Text>
          </View>
          <Text style={[styles.progressText, compact && styles.progressTextCompact]} allowFontScaling={false}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.completionContainer}>
        <View style={styles.completionRow}>
          <Text style={[styles.completionText, compact && styles.completionTextCompact]} allowFontScaling={false}>Completion Progress</Text>
          <Text style={[styles.completionText, compact && styles.completionTextCompact]} allowFontScaling={false}>{display.progressLabel}</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    padding: 20,
    borderRadius: 24,
  },
  containerCompact: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerTextCompact: {
    fontSize: 17,
  },
  progressRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 8,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
    marginTop: 4,
    minWidth: 0,
  },
  progressNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  progressNumberCompact: {
    fontSize: 20,
  },
  rateValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  rateSuffix: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  rateSuffixCompact: {
    fontSize: 14,
  },
  progressText: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 5,
    textAlign: "center",
    flexShrink: 1,
  },
  progressTextCompact: {
    fontSize: 12,
  },
  completionContainer: {
    marginTop: 15,
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completionText: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 1,
  },
  completionTextCompact: {
    fontSize: 12,
  },
  progressBarTrack: {
    marginTop: 5,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff2c",
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
});
