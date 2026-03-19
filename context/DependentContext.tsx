import React, { createContext, useContext, useMemo, useState } from 'react';

export type DependentType = 'General' | 'Child' | 'Elderly' | 'Special Needs';

export type Dependent = {
	id: string;
	name: string;
	type: DependentType;
	birthDate: string; // YYYY/MM/DD
	careNotes: string;
	notes: string;
};

type CreateDependentInput = Omit<Dependent, 'id'>;
type UpdateDependentInput = Omit<Dependent, 'id'>;

type DependentContextValue = {
	dependents: Dependent[];
	addDependent: (input: CreateDependentInput) => void;
	updateDependent: (id: string, input: UpdateDependentInput) => void;
	getDependentById: (id: string) => Dependent | undefined;
};

const DEFAULT_DEPENDENTS: Dependent[] = [];

const DependentContext = createContext<DependentContextValue | undefined>(undefined);

export function DependentProvider({ children }: { children: React.ReactNode }) {
	const [dependents, setDependents] = useState<Dependent[]>(DEFAULT_DEPENDENTS);

	const addDependent = (input: CreateDependentInput) => {
		const newDependent: Dependent = {
			id: `dep-${Date.now()}`,
			...input,
		};

		setDependents((prev) => [newDependent, ...prev]);
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
			addDependent,
			updateDependent,
			getDependentById,
		}),
		[dependents]
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
