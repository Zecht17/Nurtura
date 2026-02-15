import { LinearGradient } from "expo-linear-gradient";
import { Link, usePathname } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from 'react-native-paper';

export default function LoginScreen() {
    const [loginType, setLoginType] = useState("Caregiver");
    const [menuVisible, setMenuVisible] = useState(false);
    const pathname = usePathname();

    return (
        <LinearGradient
            colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}
            style={styles.gradient}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <View style={styles.authButtons}>
                    <Link href="/login" style={[styles.authLink, pathname === "/login" && styles.authLinkActive]}>Login</Link>
                    <Link href="/signup" style={[styles.authLink, pathname === "/signup" && styles.authLinkActive]}>Register</Link>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subText}>Sign In to continue managing your care tasks</Text>

                {/* This is the email input */}
                <Text style={styles.inputTitle}>Email or Username</Text>
                <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" placeholder="example@email.com" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                {/* This is the password input */}
                <Text style={styles.inputTitle}>Password</Text>
                <TextInput label="Password" autoCapitalize="none" keyboardType="email-address" mode="outlined" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                {/* This is the dropdown for selecting login type */}
                <Text style={styles.inputTitle}>Login as</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                    <Pressable onPress={() => setMenuVisible(true)}>
                        <TextInput
                            // label="Login As"
                            value={loginType}
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
                    <Menu.Item onPress={() => { setLoginType("Caregiver"); setMenuVisible(false); }} title="Caregiver" titleStyle={styles.dropdownItemText} />
                    <Menu.Item onPress={() => { setLoginType("Dependents"); setMenuVisible(false); }} title="Dependents" titleStyle={styles.dropdownItemText} />
                </Menu>
                {/* <Picker
                    selectedValue={loginType}
                    onValueChange={(itemValue: string) => setLoginType(itemValue)}
                    style={styles.dropdown}
                >
                    <Picker.Item label="Caregiver" value="caregiver" />
                    <Picker.Item label="Dependents" value="dependents" />
                </Picker> */}
                <Button mode="contained" style={styles.button}>Login</Button>
                <Button mode="text" style={styles.button}>Don't have an account? Sign Up</Button>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

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
});