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
    console.log('token profile:', token)
    return axios.get(
        'https://api.fitbit.com/1/user/-/profile.json',
        {
            headers: {
                Authorization: `Bearer ${token}`
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

const sleepLog = async (token, parameter) => {
    console.log('token profile:', token)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate() + 1;

    const beforeDate = `${year}-${month}-${date}`
    return axios.get(
        'https://api.fitbit.com/1.2/user/-/sleep/list.json',
        {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            },
            params: {
                sort: parameter.sort,
                limit: parameter.limit,
                offset: parameter.offset,
                beforeDate: beforeDate
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

module.exports = { authModel, getProfile, sleepLog };
