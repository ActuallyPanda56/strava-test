import { refreshStravaToken } from "./api/auth";

/**
 * Custom fetch function that includes an authorization token in the request headers.
 *
 * @param url - The URL to fetch.
 * @param options - Optional configuration for the fetch request.
 * @returns A promise that resolves to the response data.
 * @throws Will throw a standardized error object if the token refresh fails or if the fetch request is not successful.
 */
export const customFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const token = await refreshStravaToken();
    if (!token) {
      throw new Error("Failed to refresh token");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Standardized error format for non-ok responses
      const errorResponse = await response.json();
      throw {
        status: response.status,
        message:
          errorResponse?.message ||
          "An error occurred during the fetch request",
        details: errorResponse,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle and standardize errors
    if (error instanceof Error) {
      throw {
        status: 500, // Default to internal server error
        message: error.message,
        details: error,
      };
    }
    console.error("Error in customFetch:", error);
    throw {
      status: 500,
      message: "Failed to fetch data",
      details: error,
    };
  }
};
