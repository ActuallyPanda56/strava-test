import { Activity } from "../../constants/strava";
import { customFetch } from "../fetch";

/**
 * Fetches activities from the Strava API.
 *
 * @param page - The page number for pagination. Defaults to 1.
 * @param perPage - The number of items per page. Defaults to 30.
 * @returns A promise that resolves to the JSON response from the Strava API.
 * @throws Will throw a standardized error object if the fetch fails.
 */
export const fetchActivities = async (
  page: number = 1,
  perPage: number = 30
) => {
  const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;

  try {
    // Call the custom fetch function which handles the authorization token
    const data = await customFetch(url);
    return data;
  } catch (error) {
    // Handle and standardize errors thrown by customFetch
    if (error instanceof Error) {
      throw {
        status: 500,
        message: error.message,
        details: error,
      };
    } else {
      throw {
        status: 500,
        message: "An unexpected error occurred while fetching activities.",
        details: error,
      };
    }
  }
};

/**
 * Fetches activities from the Strava API within a given month, paginating if necessary.
 *
 * @param token - The access token for authentication.
 * @param month - The month to fetch activities for (1-12).
 * @param year - The year to fetch activities for.
 * @returns A promise that resolves to an array of activities for the month.
 * @deprecated This function does not handle pagination correctly. Use `aggregateMonthlyData` instead.
 */
const fetchActivitiesForMonth = async (
  token: string,
  month: number,
  year: number
) => {
  const activities = [];
  let page = 1;

  // Check if the month is the current month
  const currentDate = new Date();
  const isCurrentMonth =
    month === currentDate.getMonth() + 1 && year === currentDate.getFullYear();

  while (true) {
    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0).getTime();

    // For current month, we don't use the `after` parameter
    const url = isCurrentMonth
      ? `https://www.strava.com/api/v3/athlete/activities?before=${endOfMonth}&page=${page}`
      : `https://www.strava.com/api/v3/athlete/activities?after=${startOfMonth}&before=${endOfMonth}&page=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error(
        `Failed to fetch activities for ${month}/${year} on page ${page}`
      );
    }

    activities.push(...data);

    // If fewer than 30 activities were returned, we're done with this month
    if (data.length < 30) break;

    page++;
  }

  return activities;
};

interface AggregatedMonthlyData {
  month: string;
  year: number;
  totalDistance: number;
  totalTime: number;
  totalElevationGain: number;
}

/**
 * Fetches activities from the last N months, including the current month,
 * and aggregates data (total distance, total time, and total elevation gain) for each month.
 *
 * @param token - The authentication token for the Strava API.
 * @param numMonths - The number of months to fetch activities for. Defaults to 3.
 * @returns A promise that resolves to an array of objects with aggregated data for each month.
 * @deprecated Use `aggregateMonthlyData` instead.
 */
export const fetchAggregatedMonthlyData = async (
  token: string,
  numMonths: number = 3
): Promise<AggregatedMonthlyData[]> => {
  const currentDate = new Date();
  const aggregatedData = [];

  for (let i = 0; i < numMonths; i++) {
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() - i);

    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    const activities = await fetchActivitiesForMonth(token, month, year);

    const monthTotal = activities.reduce(
      (totals, activity) => {
        totals.totalDistance += activity.distance || 0;
        totals.totalTime += activity.moving_time || 0;
        totals.totalElevationGain += activity.total_elevation_gain || 0;
        return totals;
      },
      { totalDistance: 0, totalTime: 0, totalElevationGain: 0 }
    );

    aggregatedData.push({
      month: targetDate.toLocaleString("default", { month: "long" }),
      year,
      ...monthTotal,
    });
  }

  return aggregatedData;
};

interface aggregatedMonthlyDataResponse {
  monthlyAggregatedData: {
    month: string;
    data: {
      totalDistance: number;
      totalTime: number;
      totalElevationGain: number;
    };
  }[];
  monthsData: { month: string; data: Activity[] }[];
}

/**
 * Aggregates data for the past N months.
 *
 * @param token - The access token for authentication.
 * @param months - The number of months to aggregate data for. Default is 3.
 * @returns A promise that resolves to an object containing aggregated data for each month and the month-wise data.
 *
 */
export const aggregateMonthlyData = async (
  months: number = 3
): Promise<aggregatedMonthlyDataResponse> => {
  const currentDate = new Date();
  const monthsData: { month: string; data: Activity[] }[] = [];
  const monthlyAggregatedData: {
    month: string;
    data: {
      totalDistance: number;
      totalTime: number;
      totalElevationGain: number;
    };
  }[] = [];

  // Helper function to get the first day of the previous N months
  const getFirstDayOfMonth = (monthOffset: number): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    date.setDate(1); // Set to the first day of the month
    date.setHours(0, 0, 0, 0); // Start of the day
    return date;
  };

  // Helper function to check if an activity is within the specified month
  const isInMonth = (activity: Activity, targetMonth: Date): boolean => {
    const activityDate = new Date(activity.start_date);
    return (
      activityDate.getFullYear() === targetMonth.getFullYear() &&
      activityDate.getMonth() === targetMonth.getMonth()
    );
  };

  let page = 1;
  let activitiesFetched = false;
  let loopCount = 0;

  // Fetch activities until we have data for all requested months
  while (monthsData.length < months) {
    const activities = await fetchActivities(page, 200);

    // Stop if there is an error while fetching activities
    if (!activities) {
      console.error("Failed to fetch activities");
      break;
    }

    if (activities.error) {
      console.error(activities.error);
      break;
    }

    if (activities.length === 0) {
      console.log("No activities found");
      break;
    }

    // Loop through the activities and filter by month
    for (const activity of activities) {
      for (let i = 0; i < months; i++) {
        const targetMonth = getFirstDayOfMonth(i);

        if (isInMonth(activity, targetMonth)) {
          const monthKey = targetMonth.toISOString().slice(0, 7); // Format YYYY-MM

          // Add the activity data to the respective month in monthsData
          const existingMonth = monthsData.find(
            (entry) => entry.month === monthKey
          );

          if (existingMonth) {
            existingMonth.data.push(activity);
          } else {
            monthsData.push({ month: monthKey, data: [activity] });
          }

          // Check if the month is already present in monthlyAggregatedData
          const existingAggregatedData = monthlyAggregatedData.find(
            (entry) => entry.month === monthKey
          );

          if (existingAggregatedData) {
            existingAggregatedData.data.totalDistance += activity.distance;
            existingAggregatedData.data.totalTime += activity.moving_time;
            existingAggregatedData.data.totalElevationGain +=
              activity.total_elevation_gain;
          } else {
            monthlyAggregatedData.push({
              month: monthKey,
              data: {
                totalDistance: activity.distance,
                totalTime: activity.moving_time,
                totalElevationGain: activity.total_elevation_gain,
              },
            });
          }
        }
        loopCount++;
      }
    }

    // Check if we've collected all data for the months
    activitiesFetched = monthsData.length >= months;

    if (!activitiesFetched) page++;
  }

  return {
    monthlyAggregatedData,
    monthsData,
  };
};
