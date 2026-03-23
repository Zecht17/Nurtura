import { API_URL, useAuth } from "@/context/AuthContext";

export async function updateTaskStatus({ assignmentId, completionId, status, acknowledge }: {
    assignmentId: number;
    completionId: number;
    status: "completed" | "pending" | "missed";
    acknowledge?: boolean;
}) {
    const { user, refreshAccessToken, logout } = useAuth();
    if (!user?.access_token) {
        throw new Error("Please log in again to update task status.");
    }
    const requestBody = {
        assignment_id: assignmentId,
        completion_id: completionId,
        status,
        acknowledge: acknowledge ?? false,
    };
    const sendRequest = async (accessToken: string) => {
        return fetch(`${API_URL}/api/v1/tasks/tasks/update-status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
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
    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || data?.message || "Unable to update task status.");
    }
    return await response.json();
}
