import { useTasks } from "@/context/tasksContext";
import { computeDashboardMetricsFromTasks } from "@/utils/dashboardFromTasks";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  nowMs: number;
};

export default function TodayTasksCard({ nowMs }: Props) {
  const { tasks } = useTasks();

  const mainCount = useMemo(() => {
    const { totalTasks } = computeDashboardMetricsFromTasks(tasks, "today", nowMs);
    return String(totalTasks);
  }, [tasks, nowMs]);

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.title}>Today's Tasks</Text>
      <View style={styles.row}>
        <Text style={styles.count}>{mainCount}</Text>
        <Feather name="check-circle" size={30} color="#ffffff" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    flex: 1,
    maxWidth: 220,
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
  },
  row: {
    marginTop: 15,
    flexDirection: "row",
    gap: 50,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  count: {
    fontSize: 35,
    marginTop: -4,
    fontWeight: "bold",
    color: "#ffffff",
    alignContent: "center",
    justifyContent: "center",
  },
});
