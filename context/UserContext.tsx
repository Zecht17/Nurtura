import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, useAuth } from './AuthContext';

export type CurrentUserProfile = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    sex: string;
    birthdate: string;
    phone_number?: string;
    user_id: number;
    status: string;
    created_at: string;
    updated_at: string;
};

type UpdateCurrentUserPayload = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username: string;
    email: string;
    sex: string;
    birthdate: string;
    phone_number?: string;
};

type ChangePasswordPayload = {
    currentPassword: string;
    newPassword: string;
};

type UserContextValue = {
    profileData: CurrentUserProfile | null;
    profileLoading: boolean;
    profileError: string | null;
    updatingProfile: boolean;
    changingPassword: boolean;
    deletingAccount: boolean;
    fetchCurrentUser: () => Promise<CurrentUserProfile | null>;
    updateCurrentUser: (payload: UpdateCurrentUserPayload) => Promise<CurrentUserProfile>;
    changePassword: (payload: ChangePasswordPayload) => Promise<string>;
    deleteCurrentUser: () => Promise<string>;
    clearProfileError: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

const mapApiError = (data: any, fallback: string) => {
    if (Array.isArray(data?.detail)) {
        return data.detail.map((d: any) => d?.msg || 'Invalid value').join(', ');
    }

    if (typeof data?.detail === 'string') {
        return data.detail;
    }

    if (typeof data === 'string') {
        return data;
    }

    return fallback;
};

const parseResponseBody = async (response: Response) => {
    const bodyText = await response.text();

    if (!bodyText) {
        return null;
    }

    try {
        return JSON.parse(bodyText);
    } catch {
        return bodyText;
    }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading, refreshAccessToken, logout } = useAuth();

    const [profileData, setProfileData] = useState<CurrentUserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const clearProfileError = useCallback(() => {
        setProfileError(null);
    }, []);

    const runAuthedRequest = useCallback(
        async (
            execute: (accessToken: string) => Promise<Response>,
            fallbackError: string
        ) => {
            const initialToken = user?.access_token;
            if (!initialToken) {
                throw new Error('No active session found. Please log in again.');
            }

            let response = await execute(initialToken);

            if (response.status === 401) {
                const refreshedToken = await refreshAccessToken();
                if (refreshedToken) {
                    response = await execute(refreshedToken);
                }

                if (!refreshedToken || response.status === 401) {
                    await logout();
                    setProfileData(null);
                    setProfileError('Session expired. Please log in again.');
                    throw new Error('Session expired. Please log in again.');
                }
            }

            const data = await parseResponseBody(response);

            if (!response.ok) {
                throw new Error(mapApiError(data, fallbackError));
            }

            return data;
        },
        [user?.access_token, refreshAccessToken, logout]
    );

    const fetchCurrentUser = useCallback(async () => {
        if (authLoading) {
            return null;
        }

        if (!user?.access_token) {
            setProfileData(null);
            setProfileError('No active session found. Please log in again.');
            setProfileLoading(false);
            return null;
        }

        setProfileLoading(true);
        setProfileError(null);

        try {
            const data = await runAuthedRequest((accessToken) => {
                return fetch(`${API_URL}/api/v1/users/me`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }, 'Failed to load profile information');

            setProfileData(data as CurrentUserProfile);
            return data as CurrentUserProfile;
        } catch (err) {
            setProfileError((err as Error).message || 'Unable to fetch profile data');
            throw err;
        } finally {
            setProfileLoading(false);
        }
    }, [authLoading, user?.access_token, runAuthedRequest]);

    const updateCurrentUser = useCallback(async (payload: UpdateCurrentUserPayload) => {
        if (!user?.access_token) {
            throw new Error('No active session found. Please log in again.');
        }

        setUpdatingProfile(true);
        setProfileError(null);

        try {
            const data = await runAuthedRequest((accessToken) => {
                return fetch(`${API_URL}/api/v1/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload),
                });
            }, 'Failed to update profile');

            setProfileData(data as CurrentUserProfile);
            return data as CurrentUserProfile;
        } catch (err) {
            setProfileError((err as Error).message || 'Unable to update profile');
            throw err;
        } finally {
            setUpdatingProfile(false);
        }
    }, [user?.access_token, runAuthedRequest]);

    const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
        if (!user?.access_token) {
            throw new Error('No active session found. Please log in again.');
        }

        setChangingPassword(true);
        setProfileError(null);

        try {
            const data = await runAuthedRequest((accessToken) => {
                return fetch(`${API_URL}/api/v1/users/me/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        current_password: payload.currentPassword,
                        new_password: payload.newPassword,
                    }),
                });
            }, 'Failed to update password');

            if (typeof data === 'string') {
                return data;
            }

            return 'Password changed successfully.';
        } catch (err) {
            setProfileError((err as Error).message || 'Unable to update password');
            throw err;
        } finally {
            setChangingPassword(false);
        }
    }, [user?.access_token, runAuthedRequest]);

    const deleteCurrentUser = useCallback(async () => {
        if (!user?.access_token) {
            throw new Error('No active session found. Please log in again.');
        }

        setDeletingAccount(true);
        setProfileError(null);

        try {
            const data = await runAuthedRequest((accessToken) => {
                return fetch(`${API_URL}/api/v1/users/me`, {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }, 'Failed to delete account');

            setProfileData(null);

            if (typeof data === 'string') {
                return data;
            }

            return 'Your account has been deleted.';
        } catch (err) {
            setProfileError((err as Error).message || 'Unable to delete account');
            throw err;
        } finally {
            setDeletingAccount(false);
        }
    }, [user?.access_token, runAuthedRequest]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user?.access_token) {
            setProfileData(null);
            setProfileError(null);
            setProfileLoading(false);
            return;
        }

        fetchCurrentUser().catch(() => {
            // Errors are already stored in context state.
        });
    }, [authLoading, user?.access_token, fetchCurrentUser]);

    const value = useMemo<UserContextValue>(
        () => ({
            profileData,
            profileLoading,
            profileError,
            updatingProfile,
            changingPassword,
            deletingAccount,
            fetchCurrentUser,
            updateCurrentUser,
            changePassword,
            deleteCurrentUser,
            clearProfileError,
        }),
        [
            profileData,
            profileLoading,
            profileError,
            updatingProfile,
            changingPassword,
            deletingAccount,
            fetchCurrentUser,
            updateCurrentUser,
            changePassword,
            deleteCurrentUser,
            clearProfileError,
        ]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return ctx;
}
