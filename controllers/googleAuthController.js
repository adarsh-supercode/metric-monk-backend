import { google } from "googleapis";
import User from "../modules/User.js"; // Assuming you're using some ORM or database model

// Initialize the Admin API
const analyticsAdmin = google.analyticsadmin("v1beta");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/google/callback` // The callback URI where Google will redirect after authentication
);

// Step 1: Initiate Google OAuth Login
export const redirectToGoogle = async (req, res) => {
  const { userId } = req.query; // Extract userId from the request
  console.log(" req.query: ", req.query);

  const scopes = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    // Add the userId to the state parameter or include it as a query param
    state: userId, // Use the state parameter to pass the user ID
  });

  res.json({ redirectUrl: url });
};

// Step 2: Handle the OAuth callback
export const handleGoogleCallback = async (req, res) => {
  const { code, state: userId } = req.query; // Get the userId from state

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Find user in your database based on the userId from the OAuth flow
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user with Google tokens
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;
    await user.save();
    // Redirect to frontend with JWT token (you may need to encode it in the URL)
    res.redirect(`${process.env.FRONTEND_URL}/projects/create-projects`); // Pass the token in the URL
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkGoogleConnection = async (req, res) => {
  const { userId } = req.user; // Get authenticated user's ID from the token middleware

  try {
    // Retrieve user info from your database
    const user = await User.findOne({ where: { id: userId } });
    if (!user || !user.googleAccessToken) {
      return res.status(400).json({ isConnected: false });
    }

    // Set the user's access token in the OAuth2 client
    oauth2Client.setCredentials({ access_token: user.googleAccessToken });

    // Fetch account summaries (this will give you accounts and properties for GA4)
    const { data: accountsData } = await analyticsAdmin.accountSummaries.list({
      auth: oauth2Client,
    });

    // Extract numeric account IDs and property IDs for the accounts
    const accountsWithProperties = accountsData.accountSummaries.map(
      (account) => {
        return {
          accountId: account.account.split("/")[1], // Extract numeric account ID
          accountName: account.displayName,
          properties: account.propertySummaries.map((property) => ({
            propertyId: property.property.split("/")[1], // Extract numeric property ID
            propertyName: property.displayName,
          })),
        };
      }
    );

    // Send account data to the frontend, including numeric property IDs and account IDs
    res.json({ isConnected: true, accounts: accountsWithProperties });
  } catch (error) {
    console.error("Error checking Google Analytics GA4 connection:", error);
    res.status(500).json({ isConnected: false });
  }
};

// Step 4: Revoke Google Analytics connection
export const revokeGoogleConnection = async (req, res) => {
  const { userId } = req.user; // User from authenticated request

  try {
    // Find the user in the database
    const user = await User.findOne({ where: { id: userId } });
    console.log("user: ", user);
    if (!user || !user.googleAccessToken) {
      return res
        .status(400)
        .json({ message: "No Google Analytics connection found" });
    }

    // Revoke the Google OAuth credentials
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

    await oauth2Client.revokeCredentials();

    // Clear the tokens from the database
    user.googleAccessToken = null;
    user.googleRefreshToken = null;
    await user.save();

    res.json({ message: "Google Analytics connection revoked successfully." });
  } catch (error) {
    console.error("Error revoking Google Analytics connection:", error);
    res.status(500).json({ message: "Failed to revoke connection" });
  }
};
