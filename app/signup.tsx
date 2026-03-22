import { LinearGradient } from "expo-linear-gradient";
import { Link, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import CustomDatePickerModal from "../components/modals/CustomDatePickerModal";
import { useAuth } from "../context/AuthContext";

export default function SignUpScreen() {
  const { register, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Select Role");
  const [menuVisible, setMenuVisible] = useState(false);
  const [sex, setSex] = useState("Select Sex");
  const [sexMenuVisible, setSexMenuVisible] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const isDatePickerSupported = Platform.OS !== "web";

  const formatDateYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const [dateInputValue, setDateInputValue] = useState(formatDateYMD(new Date()));

  const handleDateChange = (date: Date) => {
    setBirthDate(date);
    setDateInputValue(formatDateYMD(date));
    if (dateError) setDateError("");
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleManualDateInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;

    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}/${digits.slice(4)}`;
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
    }

    setDateInputValue(formatted);

    const match = formatted.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!match) {
      return;
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const parsedDate = new Date(year, month - 1, day);

    if (
      !isNaN(parsedDate.getTime()) &&
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    ) {
      setBirthDate(parsedDate);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (role === "Select Role" || sex === "Select Sex") {
      Alert.alert("Error", "Please select a role and sex");
      return;
    }
    const dateMatch = dateInputValue.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!dateMatch) {
      setDateError("Birthday must be in YYYY/MM/DD format");
      return;
    }

    const apiBirthdate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;

    try {
      await register({
        first_name: firstName,
        middle_name: middleName || undefined,
        last_name: lastName,
        username,
        email,
        role,
        sex,
        birthdate: apiBirthdate,
        phone_number: phoneNumber || undefined,
        password,
      });

      Alert.alert("Success", "Registration successful!");
      router.replace("/login");
    } catch (err) {
      Alert.alert("Registration Failed", (err as Error).message);
    }
  };

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/nurtura_splash.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          {/* Top login/register toggle */}
          <View style={styles.authButtons}>
            <Link href="/login" style={[styles.authLink, pathname === "/login" && styles.authLinkActive]}>Login</Link>
            <Link href="/signup" style={[styles.authLink, pathname === "/signup" && styles.authLinkActive]}>Register</Link>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subText}>Start organizing your caregiving journey.</Text>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>First Name</Text>
              <TextInput
                placeholder="First Name"
                autoCapitalize="none"
                keyboardType="default"
                mode="outlined"
                activeOutlineColor="#6d28d9"
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Middle Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>Middle Name (Optional)</Text>
              <TextInput
                placeholder="Middle Name"
                mode="outlined"
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
                value={middleName}
                onChangeText={setMiddleName}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>Last Name</Text>
              <TextInput
                placeholder="Last Name"
                mode="outlined"
                activeOutlineColor="#6d28d9"
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>Username</Text>
              <TextInput
                placeholder="Username"
                mode="outlined"
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Email */}
            <Text style={styles.inputTitle}>Email</Text>
            <TextInput
              placeholder="example@email.com"
              keyboardType="email-address"
              mode="outlined"
              activeOutlineColor="#6d28d9"
              outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
              style={[styles.input, styles.inputField]}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputTitle}>Date of Birth *</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                value={dateInputValue}
                onChangeText={(text) => {
                  handleManualDateInput(text);
                  if (dateError) setDateError('');
                }}
                mode="outlined"
                editable={true}
                keyboardType="number-pad"
                placeholder="YYYY/MM/DD"
                right={<TextInput.Icon icon="calendar" onPress={() => {
                  if (isDatePickerSupported) {
                    setShowDatePicker(true);
                  }
                }} />}
                activeOutlineColor="#6d28d9"
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
              />
            </View>
            {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}

            {/* Role & Sex Dropdowns */}
            <View style={styles.inputRow}>
              {/* Role */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputTitle}>Role</Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Pressable onPress={() => setMenuVisible(true)}>
                      <TextInput
                        value={role}
                        editable={false}
                        mode="outlined"
                        pointerEvents="none"
                        right={<TextInput.Icon icon="menu-down" />}
                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                        style={styles.inputField}
                      />
                    </Pressable>
                  }
                    contentStyle={styles.dropdownContent}
                    style={styles.dropdown}
                >
                  <Menu.Item onPress={() => { setRole("family_member"); setMenuVisible(false); }} title="Family Member" />
                  <Menu.Item onPress={() => { setRole("caregiver"); setMenuVisible(false); }} title="Caregiver" />
                </Menu>
              </View>

              {/* Sex */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputTitle}>Sex</Text>
                <Menu
                  visible={sexMenuVisible}
                  onDismiss={() => setSexMenuVisible(false)}
                  anchor={
                    <Pressable onPress={() => setSexMenuVisible(true)}>
                      <TextInput
                        value={sex}
                        editable={false}
                        mode="outlined"
                        pointerEvents="none"
                        right={<TextInput.Icon icon="menu-down" />}
                        outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                        style={styles.inputField}
                      />
                    </Pressable>
                  }
                    contentStyle={styles.dropdownContent}
                    style={styles.dropdown}
                >
                  <Menu.Item onPress={() => { setSex("female"); setSexMenuVisible(false); }} title="Female" />
                  <Menu.Item onPress={() => { setSex("male"); setSexMenuVisible(false); }} title="Male" />
                  <Menu.Item onPress={() => { setSex("other"); setSexMenuVisible(false); }} title="Other" />
                </Menu>
              </View>
            </View>

            {/* Phone */}
            <Text style={styles.inputTitle}>Phone Number (Optional)</Text>
            <TextInput
              placeholder="09123456789"
              keyboardType="phone-pad"
              mode="outlined"
              activeOutlineColor="#6d28d9"
              outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
              style={[styles.input, styles.inputField]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>Password</Text>
              <TextInput
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                placeholder="Enter your password"
                right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(prev => !prev)} />}
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>Confirm Password</Text>
              <TextInput
                secureTextEntry={!confirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                placeholder="Confirm your password"
                right={<TextInput.Icon icon={confirmPasswordVisible ? "eye-off" : "eye"} onPress={() => setConfirmPasswordVisible(prev => !prev)} />}
                outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }}
                style={[styles.input, styles.inputField]}
              />
            </View>

            {/* Submit */}
            <Button mode="contained" onPress={handleSignUp} loading={loading} disabled={loading} style={styles.button}>
              Sign Up
            </Button>
            <Pressable onPress={() => { router.replace("/login"); }}>
              <Text style={{ textAlign: "center", marginTop: 12 }}>Already have an account? Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomDatePickerModal
        visible={isDatePickerSupported && showDatePicker}
        date={birthDate}
        onDateChange={handleDateChange}
        onClose={handleCloseDatePicker}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({

    logoContainer: {
      alignItems: "center",
      marginBottom: 14,
    },

    logo: {
      width: 120,
      height: 120,
    },

    // This is for the Login/Registration buttons
    authButtons: {
        flexDirection: "row",
        padding: 8,
        backgroundColor: "#F5F3F7",
        borderRadius: 24,
        marginBottom: 20,
        gap: 8,
    },

    authLink: {
        flex: 1,
        height: 35,
        lineHeight: 40,
        backgroundColor: "#F5F3F7",
        textAlign: "center",
        textAlignVertical: "center",
        borderRadius: 14,
        fontSize: 14,
    },

    authLinkActive: {
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },

    // background color
    gradient: {
        flex: 1,
    },

    // this is the container for the Registration form
    container: {
        flex: 1,
        padding: 20,
        borderRadius: 14,
        justifyContent: "center",
        marginTop: 20,
        // alignItems: "center",
    },

    scrollContent: {
        paddingBottom: 24,
        flexGrow: 1,
        justifyContent: "center",
    },

    content: {
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        shadowColor: "#000",
    },

    title: {
        // textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 5,
    },

    inputTitle: {
        fontSize: 12,
        color: "#2b2b2b",
        paddingBottom: 5,
    },

    subText: {
        color: "#7e7e7e",
        fontSize: 12,
        marginBottom: 24,
    },

    input: {
        marginBottom: 16,
    },

    inputField: {
        backgroundColor: "#ffffff",
        height: 45,  // to adjust the input smaller or bigger
    },

    datePickerContainer: {
      width: "100%",
    },

    inputRow: {
        flexDirection: "row",
        columnGap: 12,
        paddingBottom: 5,
    },

    inputGroup: {
        flex: 1,
        paddingBottom: 5,
    },

    button: {
        marginTop: 8,
    },

    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "39%",
        marginVertical: 45,
    },

    dropdownContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
    },

    dropdownItemText: {
        color: "#111827",
    },

    errorText: {
      color: "#b91c1c",
      marginTop: -8,
      marginBottom: 10,
      fontSize: 12,
    },
});