import { useCareSpaces } from "@/context/CareSpacesContext";
import { useDependents } from "@/context/DependentContext";
import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function DependentsCard() {
  const { dependents, loadingDependents, dependentsError } = useDependents();
  const { careSpaces, loadingCareSpaces } = useCareSpaces();
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const careSpaceDependentCount = useMemo(() => {
    const unique = new Set<string>();

    careSpaces.forEach((careSpace) => {
      (careSpace.dependents || []).forEach((dependent) => {
        const key = typeof dependent.userId === "number"
          ? `id-${dependent.userId}`
          : `name-${dependent.name.trim().toLowerCase()}`;

        unique.add(key);
      });
    });

    return unique.size;
  }, [careSpaces]);

  const count = careSpaceDependentCount > 0 ? careSpaceDependentCount : dependents.length;
  const loading = loadingCareSpaces && careSpaceDependentCount === 0 && loadingDependents;
  const showDependentsError = !!dependentsError && careSpaceDependentCount === 0;

  return (
    <LinearGradient
      colors={["#7C6FDC", "rgb(137, 94, 170)"]}
      start={{ x: 0.3706, y: 0.0171 }}
      end={{ x: 0.6294, y: 1 }}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <Text style={styles.title} allowFontScaling={false}>Dependents</Text>
      {showDependentsError ? <Text style={styles.errorText} allowFontScaling={false}>{dependentsError}</Text> : null}
      <View style={styles.row}>
        <Text style={[styles.count, compact && styles.countCompact]} allowFontScaling={false}>{loading ? "—" : String(count)}</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Octicons name="person" size={compact ? 28 : 30} color="white" />
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
  errorText: {
    fontSize: 12,
    color: "#ffcccc",
    marginBottom: 4,
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
