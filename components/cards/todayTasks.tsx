import { useTasks } from "@/context/tasksContext";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

function localTodayYyyyMmDd(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TodayTasksCard() {
  const { tasks } = useTasks();

  const dueTodayCount = useMemo(() => {
    const key = localTodayYyyyMmDd();
    return tasks.filter((t) => t.dueDate && t.dueDate === key).length;
  }, [tasks]);

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.title}>Today's Tasks</Text>
      <View style={styles.row}>
        <Text style={styles.count}>{dueTodayCount}</Text>
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
