import type { Task } from "@/context/tasksContext";
import { useTasks } from "@/context/tasksContext";
import { computeDashboardMetricsFromTasks } from "@/utils/dashboardFromTasks";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Props = {
  nowMs: number;
  tasks?: Task[];
};

export default function TodayTasksCard({ nowMs, tasks: tasksProp }: Props) {
  const { tasks: tasksFromContext } = useTasks();
  const tasks = tasksProp ?? tasksFromContext;
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const mainCount = useMemo(() => {
    const { totalTasks } = computeDashboardMetricsFromTasks(tasks, "today", nowMs);
    return String(totalTasks);
  }, [tasks, nowMs]);

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <Text style={styles.title} allowFontScaling={false}>Today's Tasks</Text>
      <View style={styles.row}>
        <Text style={[styles.count, compact && styles.countCompact]} allowFontScaling={false}>{mainCount}</Text>
        <Feather name="check-circle" size={compact ? 28 : 30} color="#ffffff" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    flex: 1,
    minWidth: 0,
  },
  cardCompact: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
    flexShrink: 1,
  },
  row: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  count: {
    fontSize: 35,
    marginTop: -2,
    fontWeight: "bold",
    color: "#ffffff",
  },
  countCompact: {
    fontSize: 32,
  },
});
