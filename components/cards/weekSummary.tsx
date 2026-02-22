import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function WeekSummaryCard() {
  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <Octicons name="graph" size={24} color="white" />
        <Text style={styles.headerText}>This Week's Summary</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>6</Text>
          <Text style={styles.progressText}>Total Tasks</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>0</Text>
          <Text style={styles.progressText}>Completed</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>0%</Text>
          <Text style={styles.progressText}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.completionContainer}>
        <View style={styles.completionRow}>
          <Text style={styles.completionText}>Completion Progress</Text>
          <Text style={styles.completionText}>0%</Text>
        </View>
        <View style={styles.progressBar}></View>
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
  progressBar: {
    marginTop: 5,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff2c",
    width: "100%",
  },
});
