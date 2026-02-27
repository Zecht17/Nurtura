import { ReactNode, createContext, useContext, useMemo, useState } from "react";

export type Task = {
    id: string;
    title: string;
    dependent: string;
    description: string;
    status: "pending" | "completed" | "missing";
    dueDate?: string;
    dueTime?: string;
    category?: string;
    priority?: string;
    recurringPattern?: string | null;
    reminderEnabled?: boolean;
};

type TasksContextValue = {
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = (task: Task) => {
        setTasks((prev) => [...prev, task]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
    };

    const removeTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const value = useMemo(() => ({ tasks, addTask, updateTask, removeTask }), [tasks]);

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
}
