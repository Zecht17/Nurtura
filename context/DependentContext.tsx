import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, useAuth } from './AuthContext';

export type Dependent = {
	id: string;
	dependentId?: number;
	name: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	username?: string;
	email?: string;
	sex?: string;
	phoneNumber?: string;
	birthDate: string; // YYYY/MM/DD
	careNotes: string;
	notes: string;
};

type CreateDependentInput = Omit<Dependent, 'id'>;
type UpdateDependentInput = Omit<Dependent, 'id'>;

export type CreateDependentProfilePayload = {
	care_notes: string;
	first_name: string;
	middle_name?: string;
	last_name: string;
	username: string;
	email: string;
	role: 'dependent';
	sex: string;
	birthdate: string; // YYYY-MM-DD
	phone_number?: string;
	password: string;
};

export type UpdateDependentProfilePayload = {
	care_notes: string;
	first_name: string;
	middle_name?: string;
	last_name: string;
	username: string;
	email: string;
	sex: string;
	birthdate: string; // YYYY-MM-DD
	phone_number?: string;
};

export type ChangeDependentPasswordPayload = {
	old_password: string;
	new_password: string;
};

type DependentProfileApiItem = {
	care_notes?: string;
	dependent_id?: number;
	user?: {
		first_name?: string;
		middle_name?: string;
		last_name?: string;
		username?: string;
		email?: string;
		sex?: string;
		birthdate?: string;
		phone_number?: string;
	};
};

type DependentProfileApiResponse = DependentProfileApiItem;

type DependentContextValue = {
	dependents: Dependent[];
	loadingDependents: boolean;
	dependentsError: string | null;
	fetchMyDependents: () => Promise<void>;
	fetchDependentProfileById: (dependentId: number) => Promise<Dependent>;
	addDependent: (input: CreateDependentInput) => void;
	createDependentProfile: (payload: CreateDependentProfilePayload) => Promise<Dependent>;
	updateDependentProfile: (dependentId: number, payload: UpdateDependentProfilePayload) => Promise<Dependent>;
	deleteDependentProfile: (dependentId: number) => Promise<string>;
	changeDependentPassword: (dependentId: number, payload: ChangeDependentPasswordPayload) => Promise<string>;
	updateDependent: (id: string, input: UpdateDependentInput) => void;
	getDependentById: (id: string) => Dependent | undefined;
};

const DEFAULT_DEPENDENTS: Dependent[] = [];

const DependentContext = createContext<DependentContextValue | undefined>(undefined);

export function DependentProvider({ children }: { children: React.ReactNode }) {
	const [dependents, setDependents] = useState<Dependent[]>(DEFAULT_DEPENDENTS);
	const [loadingDependents, setLoadingDependents] = useState(false);
	const [dependentsError, setDependentsError] = useState<string | null>(null);
	const { user, authChecking, refreshAccessToken, logout } = useAuth();

	const addDependent = (input: CreateDependentInput) => {
		const newDependent: Dependent = {
			id: `dep-${Date.now()}`,
			...input,
		};

		setDependents((prev) => [newDependent, ...prev]);
	};

	const parseApiError = useCallback((responsePayload: any): string => {
		if (Array.isArray(responsePayload?.detail)) {
			return responsePayload.detail.map((item: any) => item?.msg).filter(Boolean).join(', ');
		}

		if (typeof responsePayload?.detail === 'string') {
			return responsePayload.detail;
		}

		if (typeof responsePayload?.message === 'string') {
			return responsePayload.message;
		}

		return 'Unable to process dependent profiles request.';
	}, []);

	const mapApiDependentToState = useCallback((item: DependentProfileApiResponse, fallbackId?: number): Dependent => {
		const fullName = [item?.user?.first_name, item?.user?.middle_name, item?.user?.last_name]
			.filter((part: string | undefined) => !!part)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();

		const safeBirthDate = (item?.user?.birthdate || '').replace(/-/g, '/');
		const resolvedId = item?.dependent_id ?? fallbackId ?? Date.now();

		return {
			id: `dep-${resolvedId}`,
			dependentId: item?.dependent_id ?? fallbackId,
			name: fullName || 'Unnamed Dependent',
			firstName: item?.user?.first_name,
			middleName: item?.user?.middle_name,
			lastName: item?.user?.last_name,
			username: item?.user?.username || undefined,
			email: item?.user?.email,
			sex: item?.user?.sex,
			phoneNumber: item?.user?.phone_number,
			birthDate: safeBirthDate,
			careNotes: item?.care_notes || '',
			notes: '',
		};
	}, []);

	const fetchMyDependents = useCallback(async () => {
		if (!user?.access_token) {
			setDependents([]);
			setDependentsError(null);
			return;
		}

		setLoadingDependents(true);
		setDependentsError(null);

		const sendFetchRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/me/dependents`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			});
		};

		try {
			let response = await sendFetchRequest(user.access_token);

			if (response.status === 401) {
				const refreshedToken = await refreshAccessToken();

				if (!refreshedToken) {
					await logout();
					setDependents([]);
					setDependentsError('Session expired. Please log in again.');
					return;
				}

				response = await sendFetchRequest(refreshedToken);
			}

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(parseApiError(data));
			}

			const items = Array.isArray(data) ? (data as DependentProfileApiItem[]) : [];
			const mappedDependents: Dependent[] = items.map((item, index) => mapApiDependentToState(item, index));

			setDependents(mappedDependents);
		} catch (err) {
			setDependentsError((err as Error).message || 'Unable to fetch dependents.');
		} finally {
			setLoadingDependents(false);
		}
	}, [user?.access_token, refreshAccessToken, logout, parseApiError, mapApiDependentToState]);

	const fetchDependentProfileById = useCallback(async (dependentId: number) => {
		if (!user?.access_token) {
			throw new Error('Please log in again to view dependent profile.');
		}

		const sendRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/${dependentId}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			});
		};

		let response = await sendRequest(user.access_token);

		if (response.status === 401) {
			const refreshedToken = await refreshAccessToken();

			if (!refreshedToken) {
				await logout();
				throw new Error('Session expired. Please log in again.');
			}

			response = await sendRequest(refreshedToken);
		}

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(parseApiError(data));
		}

		const normalizedDependent = mapApiDependentToState((data || {}) as DependentProfileApiResponse, dependentId);

		setDependents((prev) => {
			const exists = prev.some((dependent) =>
				dependent.dependentId === dependentId || dependent.id === `dep-${dependentId}`
			);

			if (!exists) {
				return [normalizedDependent, ...prev];
			}

			return prev.map((dependent) => {
				const sameRecord = dependent.dependentId === dependentId || dependent.id === `dep-${dependentId}`;
				return sameRecord ? normalizedDependent : dependent;
			});
		});

		return normalizedDependent;
	}, [user?.access_token, refreshAccessToken, logout, parseApiError, mapApiDependentToState]);

	useEffect(() => {
		if (authChecking) {
			return;
		}

		if (!user?.access_token) {
			setDependents([]);
			setDependentsError(null);
			return;
		}

		fetchMyDependents();
	}, [authChecking, user?.access_token, fetchMyDependents]);

	const createDependentProfile = async (payload: CreateDependentProfilePayload) => {
		if (!user?.access_token) {
			throw new Error('Please log in again to create a dependent profile.');
		}

		const sendCreateRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload),
			});
		};

		let response = await sendCreateRequest(user.access_token);

		if (response.status === 401) {
			const refreshedToken = await refreshAccessToken();

			if (!refreshedToken) {
				await logout();
				throw new Error('Session expired. Please log in again.');
			}

			response = await sendCreateRequest(refreshedToken);
		}

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(parseApiError(data));
		}

		const fullName = [
			data?.user?.first_name ?? payload.first_name,
			data?.user?.middle_name ?? payload.middle_name,
			data?.user?.last_name ?? payload.last_name,
		]
			.filter((part: string | undefined) => !!part)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();

		const dependent: Dependent = {
			id: `dep-${data?.dependent_id ?? Date.now()}`,
			dependentId: data?.dependent_id,
			name: fullName,
			firstName: data?.user?.first_name ?? payload.first_name,
			middleName: data?.user?.middle_name ?? payload.middle_name,
			lastName: data?.user?.last_name ?? payload.last_name,
			username: data?.user?.username ?? payload.username,
			email: data?.user?.email ?? payload.email,
			sex: data?.user?.sex ?? payload.sex,
			phoneNumber: data?.user?.phone_number ?? payload.phone_number,
			birthDate: (data?.user?.birthdate ?? payload.birthdate).replace(/-/g, '/'),
			careNotes: data?.care_notes ?? payload.care_notes,
			notes: '',
		};

		setDependents((prev) => [dependent, ...prev]);
		return dependent;
	};

	const updateDependentProfile = async (dependentId: number, payload: UpdateDependentProfilePayload) => {
		if (!user?.access_token) {
			throw new Error('Please log in again to update a dependent profile.');
		}

		const sendUpdateRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/${dependentId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload),
			});
		};

		let response = await sendUpdateRequest(user.access_token);

		if (response.status === 401) {
			const refreshedToken = await refreshAccessToken();

			if (!refreshedToken) {
				await logout();
				throw new Error('Session expired. Please log in again.');
			}

			response = await sendUpdateRequest(refreshedToken);
		}

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(parseApiError(data));
		}

		const fullName = [
			data?.user?.first_name ?? payload.first_name,
			data?.user?.middle_name ?? payload.middle_name,
			data?.user?.last_name ?? payload.last_name,
		]
			.filter((part: string | undefined) => !!part)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();

		const normalizedDependent: Dependent = {
			id: `dep-${data?.dependent_id ?? dependentId}`,
			dependentId: data?.dependent_id ?? dependentId,
			name: fullName,
			firstName: data?.user?.first_name ?? payload.first_name,
			middleName: data?.user?.middle_name ?? payload.middle_name,
			lastName: data?.user?.last_name ?? payload.last_name,
			username: data?.user?.username ?? payload.username,
			email: data?.user?.email ?? payload.email,
			sex: data?.user?.sex ?? payload.sex,
			phoneNumber: data?.user?.phone_number ?? payload.phone_number,
			birthDate: (data?.user?.birthdate ?? payload.birthdate).replace(/-/g, '/'),
			careNotes: data?.care_notes ?? payload.care_notes,
			notes: '',
		};

		setDependents((prev) =>
			prev.map((dependent) => {
				const sameRecord = dependent.dependentId === dependentId || dependent.id === `dep-${dependentId}`;
				return sameRecord ? normalizedDependent : dependent;
			})
		);

		return normalizedDependent;
	};

	const deleteDependentProfile = async (dependentId: number) => {
		if (!user?.access_token) {
			throw new Error('Please log in again to delete a dependent profile.');
		}

		const sendDeleteRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/${dependentId}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			});
		};

		let response = await sendDeleteRequest(user.access_token);

		if (response.status === 401) {
			const refreshedToken = await refreshAccessToken();

			if (!refreshedToken) {
				await logout();
				throw new Error('Session expired. Please log in again.');
			}

			response = await sendDeleteRequest(refreshedToken);
		}

		const textPayload = await response.text().catch(() => '');
		let parsedPayload: any = textPayload;

		try {
			parsedPayload = textPayload ? JSON.parse(textPayload) : null;
		} catch {
			parsedPayload = textPayload;
		}

		if (!response.ok) {
			throw new Error(parseApiError(parsedPayload));
		}

		setDependents((prev) =>
			prev.filter((dependent) => {
				const sameRecord = dependent.dependentId === dependentId || dependent.id === `dep-${dependentId}`;
				return !sameRecord;
			})
		);

		if (typeof parsedPayload === 'string' && parsedPayload.trim().length > 0) {
			return parsedPayload;
		}

		return 'Dependent profile deleted successfully.';
	};

	const changeDependentPassword = async (dependentId: number, payload: ChangeDependentPasswordPayload) => {
		if (!user?.access_token) {
			throw new Error('Please log in again to change dependent password.');
		}

		const sendChangeRequest = async (accessToken: string) => {
			return fetch(`${API_URL}/api/v1/dependent-profiles/${dependentId}/change-password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload),
			});
		};

		let response = await sendChangeRequest(user.access_token);

		if (response.status === 401) {
			const refreshedToken = await refreshAccessToken();

			if (!refreshedToken) {
				await logout();
				throw new Error('Session expired. Please log in again.');
			}

			response = await sendChangeRequest(refreshedToken);
		}

		const textPayload = await response.text().catch(() => '');
		let parsedPayload: any = textPayload;

		try {
			parsedPayload = textPayload ? JSON.parse(textPayload) : null;
		} catch {
			parsedPayload = textPayload;
		}

		if (!response.ok) {
			throw new Error(parseApiError(parsedPayload));
		}

		if (typeof parsedPayload === 'string' && parsedPayload.trim().length > 0) {
			return parsedPayload;
		}

		return 'Dependent password changed successfully.';
	};

	const updateDependent = (id: string, input: UpdateDependentInput) => {
		setDependents((prev) =>
			prev.map((dependent) => (dependent.id === id ? { ...dependent, ...input } : dependent))
		);
	};

	const getDependentById = (id: string) => {
		return dependents.find((dependent) => dependent.id === id);
	};

	const value = useMemo(
		() => ({
			dependents,
			loadingDependents,
			dependentsError,
			fetchMyDependents,
			fetchDependentProfileById,
			addDependent,
			createDependentProfile,
			updateDependentProfile,
			deleteDependentProfile,
			changeDependentPassword,
			updateDependent,
			getDependentById,
		}),
		[
			dependents,
			loadingDependents,
			dependentsError,
			fetchMyDependents,
			fetchDependentProfileById,
			createDependentProfile,
			updateDependentProfile,
			deleteDependentProfile,
			changeDependentPassword,
			updateDependent,
			getDependentById,
		]
	);

	return <DependentContext.Provider value={value}>{children}</DependentContext.Provider>;
}

export function useDependents() {
	const context = useContext(DependentContext);

	if (!context) {
		throw new Error('useDependents must be used within a DependentProvider');
	}

	return context;
}
