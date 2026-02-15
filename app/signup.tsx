import { LinearGradient } from "expo-linear-gradient";
import { Link, usePathname } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from 'react-native-paper';

export default function SignUpScreen() {

    const [loginType, setLoginType] = useState("Select Role");
    const [menuVisible, setMenuVisible] = useState(false);
    const [sex, setSex] = useState("Select Sex");
    const [sexMenuVisible, setSexMenuVisible] = useState(false);
    const pathname = usePathname();

    return (
        <LinearGradient
            colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}
            style={styles.gradient}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.authButtons}>
                        <Link href="/login" style={[styles.authLink, pathname === "/login" && styles.authLinkActive]}>Login</Link>
                        <Link href="/signup" style={[styles.authLink, pathname === "/signup" && styles.authLinkActive]}>Register</Link>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subText}>Start organizing your care giving journey.</Text>

                {/* This is the email and password input row */}
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>First Name</Text>
                        <TextInput label="First Name" autoCapitalize="none" keyboardType="default" placeholder="Enter your first name" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Middle Name (Optional)</Text>
                        <TextInput label="Middle Name" autoCapitalize="none" keyboardType="default" placeholder="Enter your middle name (optional)" mode="outlined" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                </View>

                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Last Name</Text>
                        <TextInput label="Last Name" autoCapitalize="none" keyboardType="default" placeholder="Enter your last name" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Username</Text>
                        <TextInput label="Username" autoCapitalize="none" keyboardType="default" placeholder="Enter your username" mode="outlined" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                </View>

                {/* normal length */}
                <Text style={styles.inputTitle}>Email</Text>
                <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" placeholder="example@email.com" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                {/* This is the dropdown row for role and sex */}
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Role</Text>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                            <Pressable onPress={() => setMenuVisible(true)}>
                                <TextInput
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
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Sex</Text>
                        <Menu
                            visible={sexMenuVisible}
                            onDismiss={() => setSexMenuVisible(false)}
                            anchor={
                            <Pressable onPress={() => setSexMenuVisible(true)}>
                                <TextInput
                                    value={sex}
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
                            <Menu.Item onPress={() => { setSex("Female"); setSexMenuVisible(false); }} title="Female" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setSex("Male"); setSexMenuVisible(false); }} title="Male" titleStyle={styles.dropdownItemText} />
                            <Menu.Item onPress={() => { setSex("Other"); setSexMenuVisible(false); }} title="Other" titleStyle={styles.dropdownItemText} />
                        </Menu>
                    </View>
                </View>
                
                {/* normal length */}
                <Text style={styles.inputTitle}>Phone Number (Optional)</Text>
                <TextInput label="Phone Number" autoCapitalize="none" keyboardType="phone-pad" placeholder="09123456789" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Password</Text>
                        <TextInput label="Password" autoCapitalize="none" keyboardType="default" placeholder="Enter your password" mode="outlined"  activeOutlineColor="#6d28d9" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputTitle}>Confirm Password</Text>
                        <TextInput label="Confirm Password" autoCapitalize="none" keyboardType="default" placeholder="Confirm your password" mode="outlined" outlineStyle={{ borderRadius: 12, borderWidth: 1.5 }} style={[styles.input, styles.inputField]}/>
                    </View>
                </View>
                <Button mode="contained" style={styles.button}>Sign Up</Button>
                <Button mode="text" style={styles.button}>Already have an account? Login</Button>
                    </View>
                </ScrollView>
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

    inputRow: {
        flexDirection: "row",
        columnGap: 12,
    },

    inputGroup: {
        flex: 1,
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
});