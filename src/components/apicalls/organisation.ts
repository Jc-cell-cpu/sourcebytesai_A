"use server";

const BASE_URL = process.env.API_URL || "https://dev.sourcebytes.ai/api/v1"; // Fallback for safety

interface AuthResponse {
  success: boolean;
  error?: string;
}
interface OrganizationFormData {
  name: string;
  contact_email: string;
  account_manager_name: string;
  account_manager_email: string;
  subscription_type: string;
  address: string;
  phone_number: string;
}

interface OrganizationEdit {
  name: string;
  contact_email: string;
  phone_number: string;
  account_manager_name: string;
  account_manager_email: string;
  address: string;
  is_active: boolean;
}

export async function getOrganisationList(token: string): Promise<any> {
  const url = `${BASE_URL}/tenants/organizations/`;
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

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
export async function createOrganisation(
  token: string,
  formData: OrganizationFormData
): Promise<any> {
  const url = `${BASE_URL}/tenants/organizations/`;
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

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Fetching organizations failed",
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
export async function getOrganisationDetailsById(
  token: string,
  id: string
): Promise<any> {
  const url = `${BASE_URL}/tenants/organizations/${id}/`;
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

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function deleteOrganisation(
  token: string,
  id: string
): Promise<any> {
  const url = `${BASE_URL}/tenants/organizations/${id}/`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
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

export async function editOrganisation(
  token: string,
  id: string,
  form: OrganizationEdit
): Promise<any> {
  const url = `${BASE_URL}/tenants/organizations/${id}/`;
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(form),
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
