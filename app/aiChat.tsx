import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Linking, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatbot } from "../context/ChatbotContext";

export default function AIcareAssistant() {
    const {
        messages,
        loadingHistory,
        loadingMoreHistory,
        sending,
        chatError,
        hasMoreHistory,
        loadOlderHistory,
        sendMessage,
        clearChatError,
    } = useChatbot();

    const scrollViewRef = useRef<ScrollView>(null);
    const [userMessage, setUserMessage] = useState("");
    const dotAnims = useRef([
        new Animated.Value(0.3),
        new Animated.Value(0.3),
        new Animated.Value(0.3),
    ]).current;
    const typingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

    const handleSendMessage = async () => {
        const trimmed = userMessage.trim();
        if (!trimmed || sending) return;

        setUserMessage("");
        clearChatError();
        await sendMessage(trimmed);
    };

    useEffect(() => {
        if (!loadingMoreHistory) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, loadingHistory, sending, loadingMoreHistory]);

    useEffect(() => {
        if (!sending) {
            typingAnimationRef.current?.stop();
            dotAnims.forEach((dot) => dot.setValue(0.3));
            return;
        }

        const createPulse = (anim: Animated.Value) =>
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0.3,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]);

        typingAnimationRef.current = Animated.loop(
            Animated.stagger(140, dotAnims.map((dot) => createPulse(dot))),
        );
        typingAnimationRef.current.start();

        return () => {
            typingAnimationRef.current?.stop();
            dotAnims.forEach((dot) => dot.setValue(0.3));
        };
    }, [sending, dotAnims]);

    StatusBar.setBarStyle("dark-content");

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={aiStyles.container}>
                        <View style={aiStyles.headerContainer}>
                            <View>
                                <View style={aiStyles.headerRow}>
                                    <Ionicons name="sparkles-outline" size={25} color="#7C6FDC" style={aiStyles.headerIcon} />
                                    <Text style={aiStyles.headerTitle}>AI Assistant</Text>
                                </View>
                                <Text style={aiStyles.subHeader}>Ask me anything about your care schedule</Text>
                            </View>
                        </View>

                        {/* This section is for the chatbox */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={aiStyles.chatContainer}
                            contentContainerStyle={aiStyles.chatContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            {loadingHistory && (
                                <View style={aiStyles.statusRow}>
                                    <ActivityIndicator size="small" color="#7C6FDC" />
                                    <Text style={aiStyles.statusText}>Loading chat history...</Text>
                                </View>
                            )}

                            {chatError && (
                                <Text style={aiStyles.errorText}>{chatError}</Text>
                            )}

                            {hasMoreHistory && !loadingHistory && (
                                <TouchableOpacity
                                    style={aiStyles.loadMoreButton}
                                    onPress={loadOlderHistory}
                                    disabled={loadingMoreHistory}
                                >
                                    {loadingMoreHistory ? (
                                        <ActivityIndicator size="small" color="#7C6FDC" />
                                    ) : (
                                        <Text style={aiStyles.loadMoreButtonText}>Load older messages</Text>
                                    )}
                                </TouchableOpacity>
                            )}

                            {messages.map((message, index) => (
                                <View key={message.id || index} style={{ marginBottom: 15, alignItems: message.sender === "user" ? "flex-end" : "flex-start" }}>
                                    <View style={[{ flex: 1, maxWidth: "80%", padding: 11, paddingVertical: 2, borderRadius: 20 }, message.sender === "user" ? { backgroundColor: "#dedafd" } : {backgroundColor: "#efedf0"}, ]}>
                                        <Markdown style={aiMessages} onLinkPress={(url) => { Linking.openURL(url); return false; }}>
                                            {message.content}
                                        </Markdown>
                                    </View>
                                </View>
                            ))}

                            {sending && (
                                <View style={aiStyles.typingRow}>
                                    <View style={aiStyles.typingBubble}>
                                        {dotAnims.map((anim, index) => (
                                            <Animated.View
                                                key={`typing-dot-${index}`}
                                                style={[
                                                    aiStyles.typingDot,
                                                    { opacity: anim },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                        {/* Input area for the user to type their message */}
                        <View style={aiStyles.inputContainer}>
                            <TextInput
                                placeholder="Type your message..."
                                placeholderTextColor="#555"
                                style={aiStyles.input}
                                value={userMessage}
                                onChangeText={setUserMessage}
                                editable={!sending}
                                multiline
                            />
                            <TouchableOpacity style={[aiStyles.sendButton, sending && aiStyles.sendButtonDisabled]} onPress={handleSendMessage} disabled={sending}>
                                {/* <Text style={aiStyles.sendButtonText}>Send</Text> */}
                                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const aiStyles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        paddingTop: 0,
        paddingBottom: 0,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 25,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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

    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 8,
    },
    headerIcon: {
        marginTop: 18,
    },

    chatContainer: {
        flexGrow: 1,
        minHeight: 0,
        margin: 15,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        paddingTop: 10,
        borderWidth: 1,
        borderColor: "#e4ddfb",
    },

    chatContent: {
        paddingBottom: 16,
        rowGap: 12,
    },

    // messageBubble: {
    //     maxWidth: "80%",
    //     padding: 12,
    //     // color: "#333",
    //     borderRadius: 12,
    //     backgroundColor: "#F3E5F8",
    // },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 5,
        margin: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#e4ddfb",
        borderRadius: 20,
        padding: 12,
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        maxHeight: 120,
        minHeight: 40,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        backgroundColor: "#f2f2f2",
        color: "#333",
        borderRadius: 18,
    },
    sendButton: {
        backgroundColor: "#7C6FDC",
        padding: 12,
        borderRadius: 14,
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    statusText: {
        color: "#5b5b5b",
        fontSize: 13,
    },
    errorText: {
        color: "#D14343",
        fontSize: 13,
        marginBottom: 10,
    },
    loadMoreButton: {
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#d9cffc",
        backgroundColor: "#f9f7ff",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 12,
    },
    loadMoreButtonText: {
        color: "#5e4ccf",
        fontSize: 13,
        fontWeight: "600",
    },
    typingRow: {
        alignItems: "flex-start",
        marginTop: 4,
        marginBottom: 10,
    },
    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#efedf0",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    typingDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: "#8D88A4",
    },
});

const aiMessages = StyleSheet.create({
    body: { color: "#1f2933", fontSize: 16 },
    // Inline code
    code_inline: {
        backgroundColor: "#f7f4ff",
        color: "#1f2933",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        borderWidth: 1,
        borderColor: "#e0d8ff",
    },
    // Code blocks
    code_block: {
        backgroundColor: "#f7f4ff",
        color: "#1f2933",
        padding: 12,
        borderRadius: 8,
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#e0d8ff",
    },
    fence: {
        backgroundColor: "#f7f4ff",
        color: "#1f2933",
        padding: 12,
        borderRadius: 8,
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#e0d8ff",
    },
    // Tables
    table: {
        borderWidth: 1,
        borderColor: "#e4ddfb",
        borderRadius: 6,
        marginVertical: 8,
        overflow: "hidden",
        width: "190%",
    },
    thead: {
        backgroundColor: "#f3eefe",
    },
    th: {
        padding: 8,
        borderWidth: 1,
        borderColor: "#e4ddfb",
        fontWeight: "600",
        textAlign: "center",
        flex: 1,
        color: "#1f2933",
    },
    tr: {
        borderBottomWidth: 1,
        borderColor: "#ede8ff",
        flexDirection: "row",
        backgroundColor: "#ffffff",
    },
    td: {
        padding: 8,
        borderWidth: 1,
        borderColor: "#e4ddfb",
        color: "#1f2933",
        flex: 1,
    },
    tbody: {
        backgroundColor: "#ffffff",
    },
    heading1: {
        color: "#1f2933",
        fontSize: 24,
        fontWeight: "700",
        marginVertical: 8,
    },
    heading2: {
        color: "#1f2933",
        fontSize: 20,
        fontWeight: "700",
        marginVertical: 6,
    },
    heading3: {
        color: "#1f2933",
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 4,
    },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { color: "#1f2933", marginBottom: 4 },
    link: { color: "#5e4ccf", textDecorationLine: "underline" },
    blockquote: {
        backgroundColor: "#f3eefe",
        borderLeftWidth: 4,
        borderLeftColor: "#cfc2ff",
        padding: 8,
        marginVertical: 8,
    },
    hr: {
        backgroundColor: "#e4ddfb",
        height: 1,
        marginVertical: 12,
    },
});
