import "dotenv/config";

export default {
  expo: {
    name: "strava-test",
    slug: "strava-test",
    extra: {
      STRAVA_API: {
        CLIENT_ID: process.env.STRAVA_CLIENT_ID,
        CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
        REDIRECT_URI: "exp://192.168.1.20:8081",
      },
      eas: {
        projectId: "eb7d37ff-5f44-437c-8a9e-ab3b57265e17",
      },
    },
    android: {
      package: "com.vertrun.stravatest", // Replace with your unique package name
    },
  },
};
