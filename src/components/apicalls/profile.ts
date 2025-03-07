"use server";

const BASE_URL = process.env.API_URL || "https://dev.sourcebytes.ai/api/v1"; // Fallback for safety

interface EditProfile {
  name: string;
  email: string;
}

export async function getAdminProfile(token: string): Promise<any> {
  const url = `${BASE_URL}/users/profile/`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Fetching organizations failed",
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
export async function editAdminProfile(
  token: string,
  profile: EditProfile
): Promise<any> {
  const url = `${BASE_URL}/users/update-profile/`;
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Fetching organizations failed",
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
