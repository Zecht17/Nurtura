import { API_URL, useAuth } from "@/context/AuthContext";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export type NotificationRecord = {
	user_id: number;
	title: string;
	message: string;
	read: boolean;
	notification_id: number;
	created_at: string;
	updated_at: string;
};

export type CreateNotificationPayload = {
	user_id: number;
	title: string;
	message: string;
	read?: boolean;
};

export type UpdateNotificationPayload = {
	title?: string;
	message?: string;
	read?: boolean;
};

export type EphemeralNotificationRecord = {
	id: string;
	title: string;
	message: string;
	created_at: string;
	read: boolean;
};

type NotificationStatusFilter = "unread" | "read";

type NotificationContextValue = {
	notifications: NotificationRecord[];
	ephemeralNotifications: EphemeralNotificationRecord[];
	loadingNotifications: boolean;
	notificationError: string | null;
	expoPushToken: string | null;
	pushPermissionStatus: Notifications.PermissionStatus | null;
	listMyNotifications: (status?: NotificationStatusFilter) => Promise<NotificationRecord[]>;
	createNotification: (payload: CreateNotificationPayload) => Promise<NotificationRecord>;
	getNotificationById: (notificationId: number) => Promise<NotificationRecord>;
	updateNotification: (notificationId: number, payload: UpdateNotificationPayload) => Promise<NotificationRecord>;
	deleteNotification: (notificationId: number) => Promise<void>;
	deleteAllMyNotifications: () => Promise<void>;
	markNotificationAsRead: (notificationId: number) => Promise<NotificationRecord>;
	markEphemeralNotificationAsRead: (notificationId: string) => void;
	registerForPushNotifications: () => Promise<string | null>;
	sendLocalTestNotification: (title: string, message: string) => Promise<void>;
	addInAppNotification: (title: string, message: string) => void;
	clearNotificationError: () => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const parseApiError = (responsePayload: any): string => {
	if (Array.isArray(responsePayload?.detail)) {
		return responsePayload.detail.map((item: any) => item?.msg).filter(Boolean).join(", ");
	}

	if (typeof responsePayload?.detail === "string") {
		return responsePayload.detail;
	}

	if (typeof responsePayload?.message === "string") {
		return responsePayload.message;
	}

	return "Unable to process notifications request.";
};

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
	const [ephemeralNotifications, setEphemeralNotifications] = useState<EphemeralNotificationRecord[]>([]);
	const [loadingNotifications, setLoadingNotifications] = useState(false);
	const [notificationError, setNotificationError] = useState<string | null>(null);
	const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
	const [pushPermissionStatus, setPushPermissionStatus] =
		useState<Notifications.PermissionStatus | null>(null);
	const { user, authChecking, refreshAccessToken, logout } = useAuth();

	const clearNotificationError = useCallback(() => {
		setNotificationError(null);
	}, []);

	const runAuthedRequest = useCallback(
		async (requestFactory: (accessToken: string) => Promise<Response>) => {
			if (!user?.access_token) {
				throw new Error("Please log in again to manage notifications.");
			}

			let response = await requestFactory(user.access_token);

			if (response.status === 401) {
				const refreshedToken = await refreshAccessToken();

				if (!refreshedToken) {
					await logout();
					throw new Error("Session expired. Please log in again.");
				}

				response = await requestFactory(refreshedToken);
			}

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(parseApiError(data));
			}

			return data;
		},
		[user?.access_token, refreshAccessToken, logout],
	);

	const syncPushTokenToBackend = useCallback(
		async (token: string) => {
			const endpoints = [
				`${API_URL}/api/v1/notifications/push-token`,
				`${API_URL}/api/v1/users/me/push-token`,
				`${API_URL}/api/v1/users/push-token`,
				`${API_URL}/api/v1/notifications/notifications/push-token`,
			];

			for (const endpoint of endpoints) {
				try {
					await runAuthedRequest((accessToken) => {
						return fetch(endpoint, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
								Authorization: `Bearer ${accessToken}`,
							},
							body: JSON.stringify({ expo_push_token: token, push_token: token, token }),
						});
					});

					return;
				} catch {
					// Try next possible endpoint shape.
				}
			}
		},
		[runAuthedRequest],
	);

	const listMyNotifications = useCallback(
		async (status?: NotificationStatusFilter) => {
			setLoadingNotifications(true);
			setNotificationError(null);

			try {
				const params = new URLSearchParams();
				if (status) {
					params.set("status", status);
				}

				const query = params.toString();
				const data = await runAuthedRequest((accessToken) => {
					const endpoint = `${API_URL}/api/v1/notifications/notifications/me${query ? `?${query}` : ""}`;
					return fetch(endpoint, {
						method: "GET",
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
					});
				});

				const items = Array.isArray(data) ? (data as NotificationRecord[]) : [];
				setNotifications(items);
				return items;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to fetch notifications.";
				setNotificationError(message);
				throw error;
			} finally {
				setLoadingNotifications(false);
			}
		},
		[runAuthedRequest],
	);

	const createNotification = useCallback(
		async (payload: CreateNotificationPayload) => {
			setNotificationError(null);

			const normalizedPayload = {
				...payload,
				read: payload.read ?? false,
			};

			try {
				const data = await runAuthedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/notifications/notifications/`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
						body: JSON.stringify(normalizedPayload),
					});
				});

				const created = data as NotificationRecord;

				setNotifications((prev) => {
					const withoutDuplicate = prev.filter((item) => item.notification_id !== created.notification_id);
					return [created, ...withoutDuplicate];
				});

				return created;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to create notification.";
				setNotificationError(message);
				throw error;
			}
		},
		[runAuthedRequest],
	);

	const getNotificationById = useCallback(
		async (notificationId: number) => {
			if (!Number.isInteger(notificationId) || notificationId <= 0) {
				throw new Error("Invalid notification ID.");
			}

			setNotificationError(null);

			try {
				const data = await runAuthedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/notifications/notifications/${notificationId}`, {
						method: "GET",
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
					});
				});

				const found = data as NotificationRecord;

				setNotifications((prev) => {
					const withoutDuplicate = prev.filter((item) => item.notification_id !== found.notification_id);
					return [found, ...withoutDuplicate].sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					);
				});

				return found;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to fetch notification.";
				setNotificationError(message);
				throw error;
			}
		},
		[runAuthedRequest],
	);

	const updateNotification = useCallback(
		async (notificationId: number, payload: UpdateNotificationPayload) => {
			if (!Number.isInteger(notificationId) || notificationId <= 0) {
				throw new Error("Invalid notification ID.");
			}

			setNotificationError(null);

			try {
				const data = await runAuthedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/notifications/notifications/${notificationId}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
						body: JSON.stringify(payload),
					});
				});

				const updated = data as NotificationRecord;

				setNotifications((prev) => {
					const withoutDuplicate = prev.filter((item) => item.notification_id !== updated.notification_id);
					return [updated, ...withoutDuplicate].sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					);
				});

				return updated;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to update notification.";
				setNotificationError(message);
				throw error;
			}
		},
		[runAuthedRequest],
	);

	const deleteNotification = useCallback(
		async (notificationId: number) => {
			if (!Number.isInteger(notificationId) || notificationId <= 0) {
				throw new Error("Invalid notification ID.");
			}

			setNotificationError(null);

			try {
				await runAuthedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/notifications/notifications/${notificationId}`, {
						method: "DELETE",
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
					});
				});

				setNotifications((prev) => prev.filter((item) => item.notification_id !== notificationId));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to delete notification.";
				setNotificationError(message);
				throw error;
			}
		},
		[runAuthedRequest],
	);

	const deleteAllMyNotifications = useCallback(async () => {
		setNotificationError(null);

		try {
			await runAuthedRequest((accessToken) => {
				return fetch(`${API_URL}/api/v1/notifications/notifications/me`, {
					method: "DELETE",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
			});

			setNotifications([]);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to delete all notifications.";
			setNotificationError(message);
			throw error;
		}
	}, [runAuthedRequest]);

	const markNotificationAsRead = useCallback(
		async (notificationId: number) => {
			if (!Number.isInteger(notificationId) || notificationId <= 0) {
				throw new Error("Invalid notification ID.");
			}

			setNotificationError(null);

			try {
				const data = await runAuthedRequest((accessToken) => {
					return fetch(`${API_URL}/api/v1/notifications/notifications/${notificationId}/read`, {
						method: "PATCH",
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
					});
				});

				const updated = data as NotificationRecord;

				setNotifications((prev) =>
					prev.map((item) => (item.notification_id === updated.notification_id ? updated : item)),
				);

				return updated;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to mark notification as read.";
				setNotificationError(message);
				throw error;
			}
		},
		[runAuthedRequest],
	);

	const markEphemeralNotificationAsRead = useCallback((notificationId: string) => {
		setEphemeralNotifications((prev) =>
			prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
		);
	}, []);

	const registerForPushNotifications = useCallback(async () => {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#7C6FDC",
			});
		}

		const currentPermissions = await Notifications.getPermissionsAsync();
		let finalStatus = currentPermissions.status;

		if (finalStatus !== "granted") {
			const requestPermissions = await Notifications.requestPermissionsAsync();
			finalStatus = requestPermissions.status;
		}

		setPushPermissionStatus(finalStatus);

		if (finalStatus !== "granted") {
			setNotificationError("Notifications permission was not granted.");
			setExpoPushToken(null);
			return null;
		}

		const projectId =
			((Constants.expoConfig as any)?.extra?.eas?.projectId as string | undefined) ||
			((Constants as any)?.easConfig?.projectId as string | undefined);

		const tokenResponse = await Notifications.getExpoPushTokenAsync(
			projectId ? { projectId } : undefined,
		);

		setExpoPushToken(tokenResponse.data);
		syncPushTokenToBackend(tokenResponse.data).catch(() => {
			// Keep notifications functional even if token sync endpoint is unavailable.
		});
		return tokenResponse.data;
	}, [syncPushTokenToBackend]);

	const sendLocalTestNotification = useCallback(async (title: string, message: string) => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body: message,
				sound: true,
			},
			trigger: null,
		});
	}, []);

	const addInAppNotification = useCallback((title: string, message: string) => {
		setEphemeralNotifications((prev) => {
			const next: EphemeralNotificationRecord = {
				id: `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				title,
				message,
				created_at: new Date().toISOString(),
				read: false,
			};

			const deduped = prev.filter(
				(item) => !(item.title === next.title && item.message === next.message && item.read === false),
			);

			return [next, ...deduped].slice(0, 100);
		});
	}, []);

	useEffect(() => {
		if (authChecking) {
			return;
		}

		if (!user?.access_token) {
			setNotifications([]);
			setEphemeralNotifications([]);
			setNotificationError(null);
			setExpoPushToken(null);
			setPushPermissionStatus(null);
			return;
		}

		registerForPushNotifications().catch(() => {
			// Silent failure: backend notifications can still be used.
		});

		listMyNotifications().catch(() => {
			// Screen can retry manually.
		});
	}, [authChecking, user?.access_token, listMyNotifications, registerForPushNotifications]);

	useEffect(() => {
		if (!user?.access_token) {
			return;
		}

		const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
			const title = notification.request.content.title || "Task Reminder";
			const message = notification.request.content.body || "You have a task update.";

			setEphemeralNotifications((prev) => {
				const next: EphemeralNotificationRecord = {
					id: `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					title,
					message,
					created_at: new Date().toISOString(),
					read: false,
				};

				const deduped = prev.filter(
					(item) => !(item.title === next.title && item.message === next.message && item.read === false),
				);

				return [next, ...deduped].slice(0, 100);
			});

			listMyNotifications().catch(() => {
				// Keep screen usable if auto-refresh fails.
			});
		});

		const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
			listMyNotifications().catch(() => {
				// Keep screen usable if auto-refresh fails.
			});
		});

		return () => {
			receivedSubscription.remove();
			responseSubscription.remove();
		};
	}, [user?.access_token, listMyNotifications]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				ephemeralNotifications,
				loadingNotifications,
				notificationError,
				expoPushToken,
				pushPermissionStatus,
				listMyNotifications,
				createNotification,
				getNotificationById,
				updateNotification,
				deleteNotification,
				deleteAllMyNotifications,
				markNotificationAsRead,
				markEphemeralNotificationAsRead,
				registerForPushNotifications,
				sendLocalTestNotification,
				addInAppNotification,
				clearNotificationError,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error("useNotifications must be used within a NotificationProvider");
	}
	return context;
}

