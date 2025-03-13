"use server";

const BASE_URL = process.env.API_URL || "https://dev.sourcebytes.ai/api/v1"; // Fallback for safety

interface AdminFormData {
  name: string;
  tenant_id: string;
  password: string;
  email: string;
}
export async function getAdminList(token: string): Promise<any> {
  const url = `${BASE_URL}/users/get-admins/`;
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
        error: data.message || "Fetching Admin failed",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
export async function createAdmin(
  token: string,
  formData: AdminFormData
): Promise<any> {
  const url = `${BASE_URL}/auth/register/admin-user/`;

  // Print the request details
  console.log("createAdmin Request:", {
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    // const text = await response.text();
    console.log("createAdmin Response Status:", data);
    // console.log("createAdmin Raw Response:", text);

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
