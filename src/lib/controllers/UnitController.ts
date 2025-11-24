import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/const_variable";
import type { ApiResponse } from "$lib/utils/ApiResponse";

export interface Unit {
	id: number;
	name: string;
}

export async function getAllUnits(): Promise<Unit[]> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UNIT}/GetAllUnit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			}
		});

		if (!response.ok) {
			console.error("Failed to fetch units:", response.status);
			return [];
		}

		const apiResponse: ApiResponse<Unit[]> = await response.json();
		return apiResponse.data || [];
	} catch (error) {
		console.error("Error fetching units:", error);
		return [];
	}
}
