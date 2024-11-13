import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const { CLIENT_ID, CLIENT_SECRET } = Constants.expoConfig?.extra.STRAVA_API;

/**
 * Refreshes the Strava access token if it has expired.
 *
 * This function checks the current expiration time of the Strava access token stored in SecureStore.
 * If the token has expired, it sends a request to the Strava API to refresh the token using the refresh token.
 * The new access token and expiration time are then stored in SecureStore.
 *
 * @returns {Promise<string | null>} The new access token if refreshed successfully, otherwise null.
 *
 * @throws {Error} If there is an issue with the network request or response parsing.
 */
export const refreshStravaToken = async (): Promise<string | null> => {
  const refreshToken = await SecureStore.getItemAsync("strava_refresh_token");
  const expirationTime = await SecureStore.getItemAsync(
    "strava_token_expiration"
  );
  const currentTime = Date.now() / 1000; // Current time in seconds

  if (!refreshToken || !expirationTime) return null;

  // Check if the token has expired
  if (Number(expirationTime) > currentTime) {
    // Token is still valid; no need to refresh
    return await SecureStore.getItemAsync("strava_token");
  }

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await response.json();

    if (data.access_token && data.expires_at) {
      // Store new token and expiration time
      await SecureStore.setItemAsync("strava_token", data.access_token);
      await SecureStore.setItemAsync(
        "strava_token_expiration",
        data.expires_at.toString()
      );
      return data.access_token;
    } else {
      console.error("Failed to refresh token", data);
      return null;
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};
