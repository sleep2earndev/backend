const axios = require('axios');

const authModel = async (code) => {
    try {
        const response = await axios.post(
            'https://api.fitbit.com/oauth2/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
            }), {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        )
        return response.data
    } catch (error) {
        console.error("Error from Fitbit API:", error.response ? error.response.data : error.message);
        throw error;
    };
}

const getProfile = async (token) => {
    console.log('token profile:', token[1])
    return axios.get(
        'https://api.fitbit.com/1/user/-/profile.json',
        {
            headers: {
                Authorization: `Bearer ${token[1]}`
            }
        }
    ).then((res) => {
        return res.data;
    }).catch((error) => {
        return {
            message: "Request to Fitbit API failed",
            error: error.response ? error.response.data : error.message,
        }
    })
}

module.exports = { authModel, getProfile };
