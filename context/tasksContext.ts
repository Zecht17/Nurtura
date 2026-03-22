import { API_URL, useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { ReactNode, createContext, createElement, useContext, useState } from "react";

export type AuthTokenFetch = (accessToken: string) => Promise<Response>;

export type Task = {
    id: string;
    careSpaceId?: number;
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
    assignments?: any[];
    completions?: any[];
    /** Assignee user IDs — used to filter list views vs API subsets */
    assignedUserIds?: number[];
    /** Creator user id (`assigned_by` from API) */
    assignedByUserId?: number;
    /** Set when created locally so list refetches can merge briefly before the task appears in filtered API lists */
    clientCreatedAt?: number;
};

export type TaskDetail = {
    task_id?: number;
    title: string;
    description: string;
    due_date?: string;
    priority?: string;
    created_at?: string;
    updated_at?: string;
    assigned_by?: number;
    assignments: any[];
    schedules: any[];
    completions: any[];
};

type TasksContextValue = {
    tasks: Task[];
    addTask: (task: Task) => void;
    createTask: (payload: CreateTaskPayload) => Promise<Task>;
    getTaskDetail: (taskId: number, careSpaceId: number) => Promise<TaskDetail>;
    listTasksByMember: (userId: number, careSpaceId: number) => Promise<Task[]>;
    listMyTasks: (filters?: TaskListFilters) => Promise<Task[]>;
    listCreatedByMeTasks: (filters?: TaskListFilters) => Promise<Task[]>;
    updateTaskApi: (taskId: number, careSpaceId: number, payload: UpdateTaskPayload) => Promise<Task>;
    deleteTaskApi: (taskId: number, careSpaceId: number) => Promise<void>;
    updateTaskStatusApi: (payload: UpdateTaskStatusPayload) => Promise<unknown>;
    completeTaskAsUser: (task: Task) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
};

export type TaskListFilters = {
    dateFilter?: "all" | "today" | "week" | "month";
    priority?: "low" | "medium" | "high";
    status?: "pending" | "completed" | "missed";
};

export type CreateTaskPayload = {
    careSpaceId: number;
    dependentName: string;
    assignedUserIds: number[];
    taskData: {
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
        /** Full ISO datetime for API task_data.due_date (preferred over date-only dueDate above). */
        dueAtIso?: string;
        priority: string;
        category?: string;
        recurringPattern?: string | null;
        reminderEnabled?: boolean;
    };
    scheduleData: {
        start_time: string;
        end_time: string;
        recurrence_type: "none" | "daily" | "weekly" | "monthly";
        recurrence_days: number;
    }[];
};

export type UpdateTaskPayload = {
    updates: {
        title: string;
        description: string;
        due_date: string;
        priority: "low" | "medium" | "high";
    };
    assigned_user_ids: number[];
    schedule_data: {
        start_time: string;
        end_time: string;
        recurrence_type: "none" | "daily" | "weekly" | "monthly";
        recurrence_days: number;
    }[];
    localTaskOverrides?: Partial<Task>;
};

export type UpdateTaskStatusPayload = {
    assignment_id: number;
    completion_id: number;
    status: "completed" | "pending" | "missed";
    acknowledge?: boolean;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState([] as Task[]);
    const { user, refreshAccessToken, logout } = useAuth();
    const { profileData } = useUser();

    const addTask = (task: Task) => {
        setTasks((prev) => [...prev, task]);
    };

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

        return "Unable to process task request.";
    };

    const createTask = async (payload: CreateTaskPayload) => {
        if (!Number.isInteger(payload.careSpaceId) || payload.careSpaceId <= 0) {
            throw new Error("A valid care space is required.");
        }

        const trimmedTitle = payload.taskData.title.trim();
        if (!trimmedTitle) {
            throw new Error("Task title is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to create a task.");
        }

        const sanitizedAssignedUserIds = payload.assignedUserIds.filter(
            (id, index, ids) => Number.isInteger(id) && id > 0 && ids.indexOf(id) === index,
        );

        const requestBody = {
            task_data: {
                title: trimmedTitle,
                description: payload.taskData.description.trim(),
                due_date: payload.taskData.dueAtIso ?? payload.taskData.dueDate,
                priority: payload.taskData.priority.toLowerCase(),
            },
            assigned_user_ids: sanitizedAssignedUserIds,
            schedule_data: payload.scheduleData,
        };

        const sendCreateRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/tasks/tasks/?care_space_id=${payload.careSpaceId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendCreateRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendCreateRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        const assignedByFromApi = data?.assigned_by;
        const assignedByUserId =
            typeof assignedByFromApi === "number" && Number.isInteger(assignedByFromApi) && assignedByFromApi > 0
                ? assignedByFromApi
                : typeof profileData?.user_id === "number" && profileData.user_id > 0
                    ? profileData.user_id
                    : undefined;

        const createdTask: Task = {
            id: String(data?.task_id ?? Date.now()),
            careSpaceId: payload.careSpaceId,
            title: (data?.title || trimmedTitle).trim(),
            dependent: payload.dependentName,
            description: (data?.description || payload.taskData.description || "").trim(),
            status: "pending",
            dueDate: payload.taskData.dueDate,
            dueTime: payload.taskData.dueTime,
            category: payload.taskData.category,
            priority: payload.taskData.priority,
            recurringPattern: payload.taskData.recurringPattern,
            reminderEnabled: payload.taskData.reminderEnabled,
            assignedUserIds: sanitizedAssignedUserIds.length > 0 ? sanitizedAssignedUserIds : undefined,
            assignedByUserId,
            clientCreatedAt: Date.now(),
        };

        setTasks((prev) => [...prev, createdTask]);
        return createdTask;
    };

    const buildTaskListQuery = (filters?: TaskListFilters) => {
        const params = new URLSearchParams();

        params.set("date_filter", filters?.dateFilter || "all");

        if (filters?.priority) {
            params.set("priority", filters.priority);
        }

        if (filters?.status) {
            params.set("status", filters.status);
        }

        return params.toString();
    };

    const normalizeApiStatus = (
        statusValue: unknown,
        fallbackStatus: "pending" | "completed" | "missing",
    ): "pending" | "completed" | "missing" => {
        const normalized = typeof statusValue === "string" ? statusValue.toLowerCase() : "";

        if (normalized === "completed") {
            return "completed";
        }

        if (normalized === "missed" || normalized === "missing") {
            return "missing";
        }

        if (normalized === "pending") {
            return "pending";
        }

        return fallbackStatus;
    };

    const normalizeApiPriority = (priorityValue: unknown): string | undefined => {
        const normalized = typeof priorityValue === "string" ? priorityValue.trim().toLowerCase() : "";

        if (normalized === "high") {
            return "High";
        }

        if (normalized === "medium") {
            return "Medium";
        }

        if (normalized === "low") {
            return "Low";
        }

        return undefined;
    };

    const normalizeRecurringPattern = (schedules: any[]): string | null => {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return null;
        }

        const recurrenceType = (schedules[0]?.recurrence_type || "").toString().toLowerCase();

        if (recurrenceType === "daily") {
            return "Daily";
        }

        if (recurrenceType === "weekly") {
            return "Weekly";
        }

        if (recurrenceType === "monthly") {
            return "Monthly";
        }

        return null;
    };

    const splitIsoDateTime = (dueDateRaw?: string) => {
        if (!dueDateRaw) {
            return { dueDate: undefined, dueTime: undefined };
        }

        const trimmed = dueDateRaw.trim();

        // Plain YYYY-MM-DD (no time): interpret as the user's local calendar day (not UTC midnight).
        const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
        if (dateOnly) {
            const y = parseInt(dateOnly[1], 10);
            const mo = parseInt(dateOnly[2], 10) - 1;
            const d = parseInt(dateOnly[3], 10);
            const parsed = new Date(y, mo, d, 12, 0, 0, 0);
            if (isNaN(parsed.getTime())) {
                return { dueDate: trimmed, dueTime: undefined };
            }
            const yy = parsed.getFullYear();
            const mm = String(parsed.getMonth() + 1).padStart(2, "0");
            const dd = String(parsed.getDate()).padStart(2, "0");
            return {
                dueDate: `${yy}-${mm}-${dd}`,
                dueTime: undefined,
            };
        }

        const parsed = new Date(trimmed);
        if (isNaN(parsed.getTime())) {
            return { dueDate: dueDateRaw, dueTime: undefined };
        }

        // Full ISO / datetime: use local calendar date — not UTC from toISOString(),
        // or "today" on the home screen won't match tasks due tonight locally.
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        const datePart = `${y}-${m}-${d}`;
        const timePart = parsed.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        return {
            dueDate: datePart,
            dueTime: timePart,
        };
    };

    const nameFromAssignment = (a: any): string | undefined => {
        if (!a || typeof a !== "object") return undefined;
        const u = a.user;
        if (u && typeof u === "object") {
            const fullName = [u.first_name, u.middle_name, u.last_name]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();
            if (fullName) return fullName;
            if (typeof u.username === "string" && u.username.trim()) {
                return u.username.trim();
            }
        }
        const direct = [a.dependent_name, a.assignee_name, a.member_name, a.full_name, a.display_name, a.name].find(
            (v) => typeof v === "string" && v.trim().length > 0,
        ) as string | undefined;
        return direct?.trim();
    };

    const buildDependentName = (assignments: any[] | undefined, apiTask?: any): string => {
        const fromTask = [apiTask?.dependent_name, apiTask?.assignee_name, apiTask?.assignee_display_name].find(
            (v) => typeof v === "string" && v.trim().length > 0,
        ) as string | undefined;
        if (fromTask) return fromTask.trim();

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return "Unassigned";
        }

        for (const a of assignments) {
            const n = nameFromAssignment(a);
            if (n) return n;
        }

        return "Assigned Member";
    };

    const extractAssignedUserIds = (assignments: any[] | undefined): number[] | undefined => {
        if (!Array.isArray(assignments) || assignments.length === 0) {
            return undefined;
        }

        const ids = assignments
            .map((a) => {
                const raw = a?.user_id ?? a?.user?.user_id ?? a?.assigned_user_id;
                const n = Number(raw);
                return Number.isInteger(n) && n > 0 ? n : null;
            })
            .filter((x): x is number => x != null);

        const unique = [...new Set(ids)];
        return unique.length > 0 ? unique : undefined;
    };

    /** List payloads often omit root `care_space_id`; scan nested rows for DELETE/detail query param. */
    const firstCareSpaceIdFromApiTask = (apiTask: any): number | undefined => {
        const tryNum = (v: unknown): number | undefined => {
            const n = Number(v);
            return Number.isInteger(n) && n > 0 ? n : undefined;
        };
        const root = tryNum(apiTask?.care_space_id ?? apiTask?.careSpaceId);
        if (root !== undefined) return root;

        for (const key of ["assignments", "schedules", "completions"] as const) {
            const arr = apiTask?.[key];
            if (!Array.isArray(arr)) continue;
            for (const row of arr) {
                const n = tryNum(row?.care_space_id);
                if (n !== undefined) return n;
            }
        }
        return undefined;
    };

    const mapApiTaskToState = (
        apiTask: any,
        fallbackStatus: "pending" | "completed" | "missing",
        careSpaceId?: number,
    ): Task => {
        const fromPayload = firstCareSpaceIdFromApiTask(apiTask);
        const mappedCareSpaceId =
            fromPayload !== undefined
                ? fromPayload
                : typeof careSpaceId === "number" && Number.isInteger(careSpaceId) && careSpaceId > 0
                    ? careSpaceId
                    : undefined;

        const dueDateRaw = typeof apiTask?.due_date === "string" ? apiTask.due_date : undefined;
        const { dueDate, dueTime } = splitIsoDateTime(dueDateRaw);
        // Do not infer "completed" from completions.length — the API may return completion/assignment
        // rows before the assignee confirms (PATCH update-status). Use server status only.
        const status = normalizeApiStatus(apiTask?.status, fallbackStatus);

        const assignedByRaw = apiTask?.assigned_by;
        const assignedByUserId = typeof assignedByRaw === "number" && Number.isInteger(assignedByRaw) && assignedByRaw > 0
            ? assignedByRaw
            : undefined;

        return {
            id: String(apiTask?.task_id ?? Date.now()),
            careSpaceId: mappedCareSpaceId,
            title: (apiTask?.title || "Untitled Task").toString().trim(),
            dependent: buildDependentName(apiTask?.assignments, apiTask),
            description: (apiTask?.description || "").toString().trim(),
            status,
            dueDate,
            dueTime,
            priority: normalizeApiPriority(apiTask?.priority),
            recurringPattern: normalizeRecurringPattern(Array.isArray(apiTask?.schedules) ? apiTask.schedules : []),
            reminderEnabled: false,
            assignedUserIds: extractAssignedUserIds(Array.isArray(apiTask?.assignments) ? apiTask.assignments : []),
            assignedByUserId,
            assignments: Array.isArray(apiTask?.assignments) ? apiTask.assignments : undefined,
            completions: Array.isArray(apiTask?.completions) ? apiTask.completions : undefined,
        };
    };

    const runAuthedTaskListRequest = async (
        requestFactory: AuthTokenFetch,
        fallbackStatus: "pending" | "completed" | "missing",
        careSpaceId?: number,
    ) => {
        if (!user?.access_token) {
            throw new Error("Please log in again to view tasks.");
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

        const taskItems = Array.isArray(data) ? data : [];
        const mappedTasks = taskItems.map((apiTask) => mapApiTaskToState(apiTask, fallbackStatus, careSpaceId));

        let mergedTasks: Task[] = [];

        setTasks((prev) => {
            const previousById = new Map(prev.map((task) => [task.id, task] as const));
            const apiIds = new Set(mappedTasks.map((t) => t.id));

            const fromApi = mappedTasks.map((task) => {
                const previous = previousById.get(task.id);
                const preservedReminder = previous?.reminderEnabled;

                return {
                    ...task,
                    reminderEnabled: typeof preservedReminder === "boolean" ? preservedReminder : Boolean(task.reminderEnabled),
                    // List payloads sometimes omit assigned_by; keep creator id from optimistic create or prior merge.
                    assignedByUserId: task.assignedByUserId ?? previous?.assignedByUserId,
                    clientCreatedAt: previous?.clientCreatedAt ?? task.clientCreatedAt,
                };
            });

            // Union with previous tasks not returned by this endpoint. Each list (me vs created-by-me vs member)
            // is a subset; a second fetch must not drop tasks that only came from the first (fixes Home/Calendar
            // emptying after opening the Tasks tab).
            const preserved = prev.filter((task) => !apiIds.has(task.id));

            mergedTasks = [...fromApi, ...preserved];
            return mergedTasks;
        });

        return mergedTasks;
    };

    const listTasksByMember = async (userId: number, careSpaceId: number) => {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error("Invalid member user ID.");
        }

        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("A valid care space is required.");
        }

        return runAuthedTaskListRequest(
            (accessToken) => {
                return fetch(`${API_URL}/api/v1/tasks/tasks/member/${userId}?care_space_id=${careSpaceId}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            },
            "pending",
            careSpaceId,
        );
    };

    const listMyTasks = async (filters?: TaskListFilters) => {
        const query = buildTaskListQuery(filters);
        const fallbackStatus = normalizeApiStatus(filters?.status, "pending");

        return runAuthedTaskListRequest(
            (accessToken) => {
                return fetch(`${API_URL}/api/v1/tasks/tasks/me?${query}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            },
            fallbackStatus,
        );
    };

    const listCreatedByMeTasks = async (filters?: TaskListFilters) => {
        const query = buildTaskListQuery(filters);
        const fallbackStatus = normalizeApiStatus(filters?.status, "pending");

        return runAuthedTaskListRequest(
            (accessToken) => {
                return fetch(`${API_URL}/api/v1/tasks/tasks/created/me?${query}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            },
            fallbackStatus,
        );
    };

    const updateTaskApi = async (taskId: number, careSpaceId: number, payload: UpdateTaskPayload) => {
        if (!Number.isInteger(taskId) || taskId <= 0) {
            throw new Error("Invalid task ID.");
        }

        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("A valid care space is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to update this task.");
        }

        const sendRequest = async (accessToken: string) => {
            const { localTaskOverrides: _omit, ...apiPayload } = payload;
            return fetch(`${API_URL}/api/v1/tasks/tasks/${taskId}?care_space_id=${careSpaceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(apiPayload),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        const mappedTask = mapApiTaskToState(data || {}, "pending", careSpaceId);
        const updatedTask: Task = {
            ...mappedTask,
            ...payload.localTaskOverrides,
            id: String(data?.task_id ?? taskId),
            careSpaceId,
        };

        setTasks((prev) => {
            const existing = prev.some((task) => task.id === String(taskId));

            if (!existing) {
                return [updatedTask, ...prev];
            }

            return prev.map((task) => (task.id === String(taskId) ? updatedTask : task));
        });

        return updatedTask;
    };

    const updateTaskStatusApi = async (payload: UpdateTaskStatusPayload) => {
        if (!user?.access_token) {
            throw new Error("Please log in again to update task status.");
        }

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/tasks/tasks/update-status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    assignment_id: payload.assignment_id,
                    completion_id: payload.completion_id,
                    status: payload.status,
                    acknowledge: payload.acknowledge ?? false,
                }),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        return data;
    };

    const deleteTaskApi = async (taskId: number, careSpaceId: number) => {
        if (!Number.isInteger(taskId) || taskId <= 0) {
            throw new Error("Invalid task ID.");
        }

        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("A valid care space is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to delete this task.");
        }

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/tasks/tasks/${taskId}?care_space_id=${careSpaceId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        setTasks((prev) => prev.filter((task) => task.id !== String(taskId)));
    };

    const getTaskDetail = async (taskId: number, careSpaceId: number) => {
        if (!Number.isInteger(taskId) || taskId <= 0) {
            throw new Error("Invalid task ID.");
        }

        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("Invalid care space ID.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to view task details.");
        }

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/tasks/tasks/${taskId}/detail?care_space_id=${careSpaceId}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        return {
            task_id: data?.task_id,
            title: data?.title || "Untitled Task",
            description: data?.description || "",
            due_date: data?.due_date,
            priority: data?.priority,
            created_at: data?.created_at,
            updated_at: data?.updated_at,
            assigned_by: data?.assigned_by,
            assignments: Array.isArray(data?.assignments) ? data.assignments : [],
            schedules: Array.isArray(data?.schedules) ? data.schedules : [],
            completions: Array.isArray(data?.completions) ? data.completions : [],
        } as TaskDetail;
    };

    const pickFirstAssignmentId = (assignments: any[] | undefined): number => {
        const a = assignments?.[0];
        if (!a) {
            return 0;
        }
        const n = Number(a.assignment_id ?? a.id);
        return Number.isInteger(n) && n > 0 ? n : 0;
    };

    const pickFirstCompletionId = (completions: any[] | undefined): number => {
        const c = completions?.[0];
        if (!c) {
            return 0;
        }
        const n = Number(c.completion_id ?? c.id);
        return Number.isInteger(n) && n > 0 ? n : 0;
    };

    const completeTaskAsUser = async (task: Task) => {
        const taskIdNum = Number.parseInt(task.id, 10);
        if (!Number.isInteger(taskIdNum) || taskIdNum <= 0) {
            throw new Error("Invalid task ID.");
        }

        let assignmentId = pickFirstAssignmentId(task.assignments);
        let completionId = pickFirstCompletionId(task.completions);

        if (!assignmentId && task.careSpaceId) {
            const detail = await getTaskDetail(taskIdNum, task.careSpaceId);
            assignmentId = pickFirstAssignmentId(detail.assignments);
            completionId = pickFirstCompletionId(detail.completions);
        }

        if (!assignmentId) {
            throw new Error("No assignment found for this task.");
        }

        await updateTaskStatusApi({
            assignment_id: assignmentId,
            completion_id: completionId,
            status: "completed",
            acknowledge: false,
        });
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
    };

    const removeTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const value = {
        tasks,
        addTask,
        createTask,
        getTaskDetail,
        listTasksByMember,
        listMyTasks,
        listCreatedByMeTasks,
        updateTaskApi,
        deleteTaskApi,
        updateTaskStatusApi,
        completeTaskAsUser,
        updateTask,
        removeTask,
    };

    return createElement(TasksContext.Provider, { value }, children);
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
}
