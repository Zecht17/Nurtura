import { LinearGradient } from "expo-linear-gradient";
import { Link, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
//     const pingServer = async () => {
//     try {
//         const response = await fetch(`${API_URL}/api/v1/ping`, {
//             method: "GET",
//             headers: {
//                 "Accept": "application/json",
//             },
//         });

//         const data = await response.json();

//         console.log("PING RESPONSE:", data);

//         if (!response.ok) {
//             throw new Error("Ping failed");
//         }

//         alert(`Server says: ${data.ping}`); // should show "pong"
        
//     } catch (err) {
//         console.log("PING ERROR:", err);
//         alert("Cannot connect to server");
//     }
// };
    // for auth
    const [identifier, setIdentifier] = useState(""); // email or username
    const [password, setPassword] = useState("");
    
    const [passwordVisible, setPasswordVisible] = useState(false);
    // for dropdown
    const [role, setRole] = useState("Caregiver");
    const [menuVisible, setMenuVisible] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    // for navigation
    const router = useRouter();
    const pathname = usePathname();
    const { login, loading, error } = useAuth();
    StatusBar.setBarStyle("dark-content");

    const onSubmit = async () => {
        setFormError(null);
        if (!identifier || !password) {
            setFormError("Email/username and password are required.");
            return;
        }

        try {
            await login({ identifier, password, role });
            router.replace("/");
        } catch (err) {
            // error is handled in context, but keep a local fallback
            setFormError((err as Error)?.message || "Login failed");
        }
    };

    return (
        <LinearGradient
            colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}
            style={styles.gradient}
        >
            
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../assets/images/nurtura_splash.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.authButtons}>
                    <Link href="/login" style={[styles.authLink, pathname === "/login" && styles.authLinkActive]}>Login</Link>
                    <Link href="/signup" style={[styles.authLink, pathname === "/signup" && styles.authLinkActive]}>Register</Link>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subText}>Sign In to continue managing your care tasks</Text>

                {/* This is the email input */}
                <Text style={styles.inputTitle}>Email or Username</Text>
                <TextInput 
                    value={identifier}
                    onChangeText={text => setIdentifier(text)} 
                    autoCorrect={false}
                    autoCapitalize="none" 
                    keyboardType="email-address" 
                    placeholder="example@email.com" 
                    mode="outlined"  
                    activeOutlineColor="#6d28d9" 
                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} 
                    style={[styles.input, styles.inputField]}
                />
                {/* This is the password input */}
                <Text style={styles.inputTitle}>Password</Text>
                <TextInput 
                    placeholder="Enter your password"
                    secureTextEntry={!passwordVisible}
                    onChangeText={text => setPassword(text)}
                    value={password}
                    autoCorrect={false}
                    autoCapitalize="none"
                    textContentType="password" // For iOS autofill
                    autoComplete="current-password" // For Android autofill
                    mode="outlined" 
                    right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible((prev) => !prev)} forceTextInputFocus={false} />}
                    outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} 
                    style={[styles.input, styles.inputField]}
                />
                {/* This is the dropdown for selecting login type */}
                {/* <Text style={styles.inputTitle}>Login as</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                    <Pressable onPress={() => setMenuVisible(true)}>
                        <TextInput
                            // label="Login As"
                            value={role}
                            mode="outlined"
                            editable={false}
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
                    <Menu.Item onPress={() => { setRole("Family Member"); setMenuVisible(false); }} title="Family Member" titleStyle={styles.dropdownItemText} />
                    <Menu.Item onPress={() => { setRole("Caregiver"); setMenuVisible(false); }} title="Caregiver" titleStyle={styles.dropdownItemText} />
                    <Menu.Item onPress={() => { setRole("Dependents"); setMenuVisible(false); }} title="Dependents" titleStyle={styles.dropdownItemText} />
                </Menu> */}
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button mode="contained" style={styles.button} onPress={onSubmit} loading={loading} disabled={loading}>
                    Login
                </Button>
                {/* <Button 
                    mode="contained" 
                    style={styles.button} 
                    onPress={pingServer} 
                    loading={loading} 
                    disabled={loading}
                >
                    testing
                </Button> */}
                <Button mode="text" style={styles.button}>Don't have an account? Sign Up</Button>
                </View>
            </KeyboardAvoidingView>
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

    // this is the container for the login form
    container: {
        flex: 1,
        padding: 20,
        borderRadius: 14,
        justifyContent: "center",
        marginTop: 20,
        // alignItems: "center",
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

    button: {
        marginTop: 8,
    },

    dropdown: {
        padding: 12,
        borderRadius: 16,
        width: "81.5%",
        marginTop: 50,
        marginVertical: 5,
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
        marginTop: 4,
        marginBottom: 4,
    },
});