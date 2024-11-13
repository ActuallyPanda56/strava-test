import "dotenv/config";

export default {
  expo: {
    name: "strava-test",
    slug: "strava-test",
    extra: {
      STRAVA_API: {
        CLIENT_ID: process.env.STRAVA_CLIENT_ID,
        CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
        REDIRECT_URI: process.env.STRAVA_REDIRECT_URI,
      },
    },
  },
};
