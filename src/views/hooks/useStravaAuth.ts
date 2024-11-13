import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } =
  Constants.expoConfig?.extra.STRAVA_API;

export const useStravaAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<number | null>(null);

  // Initiate OAuth flow
  const initiateOAuth = () => {
    const authorizationUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all`;
    Linking.openURL(authorizationUrl);
  };

  // Load token and expiration data from SecureStore on mount
  useEffect(() => {
    const loadStoredTokens = async () => {
      const storedToken = await SecureStore.getItemAsync("strava_token");
      const storedExpiration = await SecureStore.getItemAsync(
        "strava_token_expiration"
      );

      if (storedToken && storedExpiration) {
        setToken(storedToken);
        setExpirationTime(Number(storedExpiration));
      } else {
        console.log("No stored token found");
      }
    };
    loadStoredTokens();
  }, []);

  // Handle OAuth redirect and exchange code for token
  useEffect(() => {
    const handleRedirect = async (event: { url: string }) => {
      const { url } = event;
      const { code } = Linking.parse(url).queryParams;
      if (code) {
        await exchangeAuthCodeForToken(code);
      }
    };

    const subscription = Linking.addEventListener("url", handleRedirect);
    return () => subscription.remove(); // Unsubscribe on cleanup
  }, []);

  // Exchange authorization code for access token and store it
  const exchangeAuthCodeForToken = async (authCode: string) => {
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: authCode,
          grant_type: "authorization_code",
        }),
      });
      const data = await response.json();
      console.log("Exchanged auth code for token:", data);
      if (data.access_token && data.refresh_token && data.expires_at) {
        await storeTokens(
          data.access_token,
          data.refresh_token,
          data.expires_at
        );
      } else {
        console.error("Failed to get access token", data);
      }
    } catch (error) {
      console.error("Error exchanging auth code for token:", error);
    }
  };

  // Store tokens in SecureStore and update state
  const storeTokens = async (
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  ) => {
    await SecureStore.setItemAsync("strava_token", accessToken);
    await SecureStore.setItemAsync("strava_refresh_token", refreshToken);
    await SecureStore.setItemAsync(
      "strava_token_expiration",
      expiresAt.toString()
    );

    setToken(accessToken);
    setExpirationTime(expiresAt);
  };

  return { initiateOAuth, token };
};
