import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    STRAVA_API: {
      CLIENT_ID: process.env.STRAVA_CLIENT_ID || "139892",
      CLIENT_SECRET:
        process.env.STRAVA_CLIENT_SECRET ||
        "08f79c7faf9429c48650525a8c0524f6b6ae5351",
      REDIRECT_URI:
        process.env.STRAVA_REDIRECT_URI || "exp://192.168.1.20:8081",
    },
  },
});
