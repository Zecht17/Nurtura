import { useDependents } from "@/context/DependentContext";
import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function DependentsCard() {
  const { dependents, loadingDependents, dependentsError } = useDependents();

  const count = dependents.length;

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.title}>Dependents</Text>
      {dependentsError ? <Text style={styles.errorText}>{dependentsError}</Text> : null}
      <View style={styles.row}>
        <Text style={styles.count}>{loadingDependents ? "—" : String(count)}</Text>
        {loadingDependents ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Octicons name="person" size={30} color="white" />
        )}
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
  errorText: {
    fontSize: 12,
    color: "#ffcccc",
    marginBottom: 4,
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
