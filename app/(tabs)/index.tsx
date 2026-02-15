import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.view}
    >
      <Text>Testing Nurtura</Text>
      <Link href="/login">Go to Login</Link>
      <Link href="/signup">Go to Sign Up</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
});