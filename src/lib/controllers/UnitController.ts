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

export async function getUnitsByName(name: string): Promise<Unit | null> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UNIT}/GetUnitByName`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name }),
		});

		if (!response.ok) {
			console.error("Failed to fetch units:", response.status);
			return null;
		}

		const apiResponse: ApiResponse<Unit> = await response.json();
		return apiResponse.data || null;
	} catch (error) {
		console.error("Error fetching units:", error);
		return null;
	}
}
