import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { LinearGradient } from "expo-linear-gradient";
import { Link } from 'expo-router';
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Menu, RadioButton, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [range, setRange] = useState("Today");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View>
          {/* <View style={styles.view}>
          <Link href="/login">Go to Login </Link>
          <Link href="/signup">Go to Sign Up</Link>
        </View> */}

          {/* This is the Greeting Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Welcome Back, Juztine Miguel!</Text>
            <Text style={styles.subHeader}>Here's your caregiving overview for today.</Text>
          </View>

          {/* This the Summary Components */}
          <View style={styles.summaryContainer}>
            <LinearGradient colors={["#7C6FDC", "rgb(137, 94, 170)"]} start={{ x: 0.3706, y: 0.0171 }} end={{ x: 0.6294, y: 1 }} style={styles.summaryContainer}>
              <View style={styles.summaryTextContainer}>
                <Octicons name="graph" size={24} color="white" />
                <Text style={styles.summaryText}>This Week's Summary</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressText}>
                  <Text style={styles.progressNumber}>6</Text>
                  <Text style={styles.progressText}>Total Tasks</Text>
                </View>

                <View style={styles.progressText}>
                  <Text style={styles.progressNumber}>0</Text>
                  <Text style={styles.progressText}>Completed</Text>
                </View>

                <View style={styles.progressText}>
                  <Text style={styles.progressNumber}>0%</Text>
                  <Text style={styles.progressText}>Success Rate</Text>
                </View>
              </View>

              <View style={styles.completionContainer}>
                <View style={styles.completionText}>
                  <Text style={styles.completionText}>Completion Progress</Text>
                  <Text style={styles.completionText}>0%</Text>
                </View>
                <View style={styles.progressBar}></View>
              </View>

            </LinearGradient>
          </View>

          {/* This is for the Today's Tasks and Dependents */}
          <View style={styles.cardsRow}>
            <LinearGradient colors={["#7C6FDC", "rgb(137, 94, 170)"]} start={{ x: 0.3706, y: 0.0171 }} end={{ x: 0.6294, y: 1 }} style={[styles.summaryContainer, styles.smallCard]}>
              <Text style={styles.dependentInfoTitle}>Today's Tasks</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.dependentInfoText}>5</Text>
                <Feather name="check-circle" size={30} color="#ffffff" />
              </View>
            </LinearGradient>

            <LinearGradient colors={["#7C6FDC", "rgb(137, 94, 170)"]} start={{ x: 0.3706, y: 0.0171 }} end={{ x: 0.6294, y: 1 }} style={[styles.summaryContainer, styles.smallCard]}>
              <Text style={styles.dependentInfoTitle}>Dependents</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.dependentInfoText}>2</Text>
                <Octicons name="person" size={30} color="white" />
              </View>
            </LinearGradient>
          </View>

          {/* This is for the  Task row, dropdown, and add button */}
          <View style={styles.taskOptions}>
            <Text style={styles.taskOptionsText}>Tasks</Text>
            <View style={styles.taskOptionButtons}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Pressable onPress={() => setMenuVisible(true)}>
                    <TextInput
                      value={range}
                      mode="outlined"
                      editable={false}
                      pointerEvents="none"
                      right={<TextInput.Icon icon="menu-down" />}
                      outlineStyle={{ borderRadius: 16, borderWidth: 0.1 }}
                      style={styles.inputField}
                    />
                  </Pressable>
                }
                contentStyle={styles.dropdownContent}
                style={styles.dropdown}
              >
                <Menu.Item onPress={() => { setRange("Today"); setMenuVisible(false); }} title="Today" titleStyle={styles.dropdownItemText} />
                <Menu.Item onPress={() => { setRange("Week"); setMenuVisible(false); }} title="This Week" titleStyle={styles.dropdownItemText} />
                <Menu.Item onPress={() => { setRange("Month"); setMenuVisible(false); }} title="This Month" titleStyle={styles.dropdownItemText} />
              </Menu>
              
              <Link href="/addTask">
              <View style={styles.addButton}>
                <AntDesign name="plus" size={18} color="white" />
                <Text style={{ color: "white", marginLeft: 8, fontSize: 18 }}>Add</Text>
              </View>
              </Link>

            </View>
          </View>
          
          {/* This is the Task Card */}
          <View style={styles.taskCardContainer}>
            <View>
              <View style={styles.taskCard}>
                {/* Radio Button */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 5 }}>
                  <RadioButton
                    value="morning-med"
                    status={selectedTask === "morning-med" ? "checked" : "unchecked"}
                    onPress={() => setSelectedTask("morning-med")}
                    color="#7C6FDC"
                    uncheckedColor="#666"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskOptionsText}>Morning Medication</Text>
                    <Text style={styles.taskSubHeader}>Jirah Denisse</Text>
                    <Text style={styles.taskSubHeader}>Give multivitamin with breakfast</Text>
                  </View>
                </View>
                {/* Status */}
                <View style={status.Row}>
                  <View style={status.Pending}>
                    <Text style={status.PendingText}>Pending</Text>
                  </View>
                  <View style={status.Urgency}>
                    <Text style={status.highPriorityText}>High Priority</Text>
                  </View>
                  <View style={status.Recurring}>
                    <Text style={status.dailyText}>Daily</Text>
                  </View>
                </View>

                <View style={status.Row}>
                  <LinearGradient colors={["#e0e0e0", "#cecdcd"]} start={{ x: 0.3706, y: 0.0171 }} end={{ x: 0.6294, y: 0.932 }} style={status.Date} >
                    <Text style={status.dateText}>Feb 8, 2026 Sunday 8:00 am</Text>
                  </LinearGradient>
                </View>
              </View>

            </View>


            {/* This is where the next card goes */}

          </View>
          
          {/* Quick Actions */}
          <View style={styles.taskOptions}>
            <Text style={styles.taskOptionsText}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionRow}>
            <View style={styles.quickActionCard}>
              <Entypo name="text-document" size={24} color="#7C6FDC" />
              <Text style={styles.quickActionText}>Care Spaces</Text>
            </View>
            <View style={styles.quickActionCard}>
              <MaterialCommunityIcons name="star-four-points-outline" size={24} color="#7C6FDC" />
              <Text style={styles.quickActionText}>AI Assistant</Text>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },

  view: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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

  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },

  summaryTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  progressContainer: {
    marginTop: 15,
    flexDirection: "row",
    gap: 50,
    alignContent: "center",
    justifyContent: "center",
    // backgroundColor: "#ffffff",
    // borderRadius: 14,
    // padding: 10,
    // height: 100,
  },

  progressText: {
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

  completionContainer: {
    marginTop: 15,
  },

  completionText: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressBar: {
    marginTop: 5,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff2c",
    width: "100%",
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  smallCard: {
    flex: 1,
    maxWidth: 220,
  },

  dependentInfoText: {
    fontSize: 35,
    marginTop: -4,
    fontWeight: "bold",
    color: "#ffffff",
    alignContent: "center",
    justifyContent: "center",
  },

  dependentInfoTitle: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
  },

  taskOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  taskOptionsText: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#000000",
  },

  inputField: {
    width: 100,
    height: 35,
    backgroundColor: "#ffffff",
  },

  dropdown: {
    padding: 12,
    borderRadius: 16,
    width: "35%",
    marginTop: 30,
    marginHorizontal: -20,
  },

  dropdownContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },

  dropdownItemText: {
    color: "#111827",
  },

  taskOptionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C6FDC",
    width: 100,
    height: 35,
    borderRadius: 16,
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

  taskCard: {
    width: "100%",
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  taskSubHeader: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },

  quickActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 12,
    paddingHorizontal: 15,
    marginBottom: 0,
  },

  quickActionCard: {
    flex: 1,
    flexDirection: "column",
    width: "50%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
});

// Status Styles
const status = StyleSheet.create({
  Row: {
    paddingLeft: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  Pending: {
    backgroundColor: "#FBBF24",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  PendingText: {
    color: "#ffffff",
    fontSize: 14,
    // fontWeight: "bold",
  },

  Urgency: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  highPriorityText: {
    color: "#ffffff",
    fontSize: 14,
    // fontWeight: "bold",
  },

  Recurring: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  dailyText: {
    color: "#ffffff",
    fontSize: 14,
    // fontWeight: "bold",
  },

  Date: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  dateText: {
    color: "#000000",
    fontSize: 14,
    // fontWeight: "bold",
  },
});