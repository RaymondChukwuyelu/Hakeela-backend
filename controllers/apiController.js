const axios = require('axios')

//ZOOM CALLBACK LOGIC

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

// Get access token
async function getZoomAccessToken() {
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {},
    {
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET,
      },
    }
  );

  return response.data.access_token;
}

// Create meeting
const createMeeting = async (req, res) => {
  try {
    const token = await getZoomAccessToken();

    const meeting = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: "Quick Meeting",
        type: 1, // instant meeting
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   return res.json({
      join_url: meeting.data.join_url,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to create meeting" });
  }
};

module.exports = {
    createMeeting
}