"use server";

const BASE_URL = process.env.API_URL || "https://dev.sourcebytes.ai/api/v1"; // Fallback for safety

interface form {
  email: string;
  password: string;
}

export async function login(formData: form): Promise<any> {
  const url = `${BASE_URL}/auth/login/`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Authentication failed",
      };
    }

    // Set HTTP-only cookie
    // (await
    //     // Set HTTP-only cookie
    //     cookies()).set({
    //         name: "authToken",
    //         value: data.data.token,
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: "lax",
    //         path: "/",
    //         maxAge: 60 * 60 * 24 * 2, // 2 day
    //     });

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
