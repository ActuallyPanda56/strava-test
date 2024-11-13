import { refreshStravaToken } from "./api/auth";

/**
 * Custom fetch function that includes an authorization token in the request headers.
 *
 * @param url - The URL to fetch.
 * @param options - Optional configuration for the fetch request.
 * @returns A promise that resolves to the response data.
 * @throws Will throw an error if the token refresh fails or if the fetch request is not successful.
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

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API error: ${JSON.stringify(data.errors, null, 2)}`);
    }

    return data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in customFetch:", error);
    // Optionally, you can rethrow the error or handle it accordingly
    throw error; // rethrowing the error ensures the caller can handle it
  }
};
