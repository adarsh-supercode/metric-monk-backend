import { google } from "googleapis";
import User from "../modules/User.js";

// Initialize the Analytics API
const analyticsData = google.analyticsdata("v1beta");

export const fetchGARealTimeData = async (req, res) => {
  const { propertyId } = req.params; // Get propertyId from the request params
  const userId = req.user.userId; // Ensure user is authenticated

  try {
    // Find the user in the database
    const user = await User.findOne({ where: { id: userId } });

    if (!user || !user.googleAccessToken) {
      return res
        .status(400)
        .json({ message: "Google Analytics connection not found." });
    }

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken, // Make sure you have this stored
    });

    const tokens = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(tokens.credentials);
    // Try to fetch real-time data
    let response;
    try {
      response = await analyticsData.properties.runRealtimeReport({
        property: `properties/${propertyId}`, // Use the propertyId
        requestBody: {
          dimensions: [{ name: "eventName" }], // Example: get event names in real-time
          metrics: [{ name: "eventCount" }], // Example metric: event count in real-time
        },
        auth: oauth2Client,
      });
    } catch (err) {
      // If there's an error due to invalid credentials, refresh the token
      if (err.code === 401) {
        // Refresh token
        const { tokens } = await oauth2Client.getAccessToken();
        // Update user's access token in the database
        user.googleAccessToken = tokens.access_token;
        await user.save();

        // Retry fetching data with the new access token
        oauth2Client.setCredentials({ access_token: tokens.access_token });
        response = await analyticsData.properties.runRealtimeReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dimensions: [{ name: "eventName" }],
            metrics: [{ name: "eventCount" }],
          },
          auth: oauth2Client,
        });
      } else {
        throw err; // Re-throw for non-401 errors
      }
    }

    // Respond with the fetched data
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching real-time Google Analytics data:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch real-time analytics data" });
  }
};
