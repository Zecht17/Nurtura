import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_URL, useAuth } from "./AuthContext";

export type ChatMessage = {
	id: string;
	sender: "user" | "ai";
	content: string;
};

type ChatbotContextValue = {
	messages: ChatMessage[];
	loadingHistory: boolean;
	loadingMoreHistory: boolean;
	sending: boolean;
	chatError: string | null;
	hasMoreHistory: boolean;
	fetchHistory: () => Promise<void>;
	loadOlderHistory: () => Promise<void>;
	sendMessage: (text: string) => Promise<void>;
	clearChatError: () => void;
};

const HISTORY_PAGE_SIZE = 20;
const WELCOME_MESSAGE: ChatMessage = {
	id: "welcome",
	sender: "ai",
	content: "Hello! How can I assist you today?",
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
	const { user, refreshAccessToken, logout } = useAuth();

	const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
	const [loadingHistory, setLoadingHistory] = useState(false);
	const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
	const [sending, setSending] = useState(false);
	const [chatError, setChatError] = useState<string | null>(null);
	const [historyOffset, setHistoryOffset] = useState(0);
	const [hasMoreHistory, setHasMoreHistory] = useState(true);

	const clearChatError = useCallback(() => {
		setChatError(null);
	}, []);

	const parseApiError = useCallback((data: any, fallback: string) => {
		if (Array.isArray(data?.detail)) {
			return data.detail.map((d: any) => d?.msg || "Invalid value").join(", ");
		}
		if (typeof data?.detail === "string") {
			return data.detail;
		}
		if (typeof data === "string") {
			return data;
		}
		return fallback;
	}, []);

	const mapHistoryPayloadToMessages = useCallback((payload: any): { messages: ChatMessage[]; rowCount: number } => {
		const rows = Array.isArray(payload?.history) ? payload.history : [];
		const chronologicalRows = [...rows].reverse();
		const mapped: ChatMessage[] = [];

		chronologicalRows.forEach((row: any, index: number) => {
			const stamp = row?.created_at || `${Date.now()}-${index}`;
			if (row?.user) {
				mapped.push({
					id: `hist-user-${stamp}-${index}`,
					sender: "user",
					content: String(row.user),
				});
			}

			if (row?.ai) {
				mapped.push({
					id: `hist-ai-${stamp}-${index}`,
					sender: "ai",
					content: String(row.ai),
				});
			}
		});

		return { messages: mapped, rowCount: rows.length };
	}, []);

	const authedRequest = useCallback(
		async (request: (accessToken: string) => Promise<Response>) => {
			const initialToken = user?.access_token;
			if (!initialToken) {
				throw new Error("No active session found. Please log in again.");
			}

			let response = await request(initialToken);

			if (response.status === 401) {
				const refreshed = await refreshAccessToken();
				if (refreshed) {
					response = await request(refreshed);
				}

				if (!refreshed || response.status === 401) {
					await logout();
					throw new Error("Session expired. Please log in again.");
				}
			}

			const text = await response.text();
			let data: any = null;

			if (text) {
				try {
					data = JSON.parse(text);
				} catch {
					data = text;
				}
			}

			if (!response.ok) {
				throw new Error(parseApiError(data, "Request failed"));
			}

			return data;
		},
		[logout, parseApiError, refreshAccessToken, user?.access_token]
	);

	const fetchHistory = useCallback(async () => {
		if (!user?.access_token) {
			setMessages([WELCOME_MESSAGE]);
			setChatError(null);
			setHistoryOffset(0);
			setHasMoreHistory(true);
			return;
		}

		setLoadingHistory(true);
		setChatError(null);

		try {
			const data = await authedRequest((accessToken) => {
				return fetch(`${API_URL}/api/v1/chatbot/chat/history?limit=${HISTORY_PAGE_SIZE}&offset=0`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
			});

			const { messages: historyMessages, rowCount } = mapHistoryPayloadToMessages(data);
			if (historyMessages.length > 0) {
				setMessages(historyMessages);
			} else {
				setMessages([WELCOME_MESSAGE]);
			}

			setHistoryOffset(rowCount);
			setHasMoreHistory(rowCount === HISTORY_PAGE_SIZE);
		} catch (err) {
			setChatError((err as Error).message || "Failed to load chat history.");
		} finally {
			setLoadingHistory(false);
		}
	}, [authedRequest, mapHistoryPayloadToMessages, user?.access_token]);

	const loadOlderHistory = useCallback(async () => {
		if (!user?.access_token || !hasMoreHistory || loadingMoreHistory || loadingHistory) {
			return;
		}

		setLoadingMoreHistory(true);
		setChatError(null);

		try {
			const data = await authedRequest((accessToken) => {
				return fetch(`${API_URL}/api/v1/chatbot/chat/history?limit=${HISTORY_PAGE_SIZE}&offset=${historyOffset}`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
			});

			const { messages: olderMessages, rowCount } = mapHistoryPayloadToMessages(data);

			if (olderMessages.length > 0) {
				setMessages((prev) => {
					const base = prev.length === 1 && prev[0].id === WELCOME_MESSAGE.id ? [] : prev;
					return [...olderMessages, ...base];
				});
			}

			setHistoryOffset((prev) => prev + rowCount);
			setHasMoreHistory(rowCount === HISTORY_PAGE_SIZE);
		} catch (err) {
			setChatError((err as Error).message || "Failed to load older messages.");
		} finally {
			setLoadingMoreHistory(false);
		}
	}, [authedRequest, hasMoreHistory, historyOffset, loadingHistory, loadingMoreHistory, mapHistoryPayloadToMessages, user?.access_token]);

	const sendMessage = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed || sending) {
				return;
			}

			if (!user?.access_token) {
				setChatError("No active session found. Please log in again.");
				return;
			}

			const userMsg: ChatMessage = { id: `user-${Date.now()}`, sender: "user", content: trimmed };
			setMessages((prev) => [...prev, userMsg]);
			setSending(true);
			setChatError(null);

			try {
				const data = await authedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/chatbot/chat`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
						body: JSON.stringify({ message: trimmed }),
					});
				});

				const aiText = typeof data === "string" ? data : data?.message || data?.reply || "No response.";
				const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, sender: "ai", content: aiText };
				setMessages((prev) => [...prev, aiMsg]);
			} catch (err) {
				const errorMessage = (err as Error).message || "Failed to send message.";
				setChatError(errorMessage);
				const aiMsg: ChatMessage = {
					id: `ai-error-${Date.now()}`,
					sender: "ai",
					content: `I couldn't process that right now. ${errorMessage}`,
				};
				setMessages((prev) => [...prev, aiMsg]);
			} finally {
				setSending(false);
			}
		},
		[authedRequest, sending, user?.access_token]
	);

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory, user?.access_token]);

	const value = useMemo<ChatbotContextValue>(
		() => ({
			messages,
			loadingHistory,
			loadingMoreHistory,
			sending,
			chatError,
			hasMoreHistory,
			fetchHistory,
			loadOlderHistory,
			sendMessage,
			clearChatError,
		}),
		[
			messages,
			loadingHistory,
			loadingMoreHistory,
			sending,
			chatError,
			hasMoreHistory,
			fetchHistory,
			loadOlderHistory,
			sendMessage,
			clearChatError,
		]
	);

	return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
	const ctx = useContext(ChatbotContext);
	if (!ctx) {
		throw new Error("useChatbot must be used within a ChatbotProvider");
	}

	return ctx;
}
