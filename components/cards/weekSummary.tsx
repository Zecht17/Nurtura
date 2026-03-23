import { useTasks } from "@/context/tasksContext";
import type { DashboardTimeFilter } from "@/utils/dashboardFromTasks";
import { computeDashboardMetricsFromTasks } from "@/utils/dashboardFromTasks";
import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const FILTER_LABEL: Record<DashboardTimeFilter, string> = {
  today: "Today's Summary",
  week: "This Week's Summary",
  month: "This Month's Summary",
};

type Props = {
  filter: DashboardTimeFilter;
  /** Same clock as Home task list (`computeComputedTaskStatus` / overdue). */
  nowMs: number;
};

export default function WeekSummaryCard({ filter, nowMs }: Props) {
  const { tasks } = useTasks();
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
      rate: `${metrics.completionPercentage}%`,
      progressLabel: `${metrics.completionPercentage}%`,
    }),
    [metrics],
  );

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <Octicons name="graph" size={24} color="white" />
        <Text style={styles.headerText}>{headerText}</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{display.total}</Text>
          <Text style={styles.progressText}>Total Tasks</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{display.completed}</Text>
          <Text style={styles.progressText}>Completed</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{display.rate}</Text>
          <Text style={styles.progressText}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.completionContainer}>
        <View style={styles.completionRow}>
          <Text style={styles.completionText}>Completion Progress</Text>
          <Text style={styles.completionText}>{display.progressLabel}</Text>
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
  progressRow: {
    marginTop: 15,
    flexDirection: "row",
    gap: 50,
    alignContent: "center",
    justifyContent: "center",
  },
  progressItem: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    color: "#ffffff",
    marginTop: 5,
  },
  progressNumber: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  progressText: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    color: "#ffffff",
    marginTop: 5,
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
    fontSize: 16,
    color: "#ffffff",
    marginTop: 1,
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
