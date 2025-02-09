const axios = require('axios');

const getToken = async (headers, body) => {
    const { grant_type, code, redirect_uri } = body;
    let { authorization} = headers;

    console.log("Headers Received:", headers);
    console.log("Body Received:", body);

    // validasi undefined atau kosong
    if (!authorization) {
        return Promise.reject({ message: "Missing Authorization header" });
    }

    return new Promise((resolve, reject) => {
        axios.post(
            'https://api.fitbit.com/oauth2/token',
            new URLSearchParams({ grant_type, code, redirect_uri }).toString(),
            {
                headers: {
                    Authorization:authorization, 
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        ).then((res) => {
            console.log("Response from Fitbit API:", res.data);
            resolve(res.data); 
        }).catch((error) => {
            console.error("Error from Fitbit API:", error.response ? error.response.data : error.message);

            reject({
                message: "Request to Fitbit API failed",
                error: error.response ? error.response.data : error.message
            });
        });
    });
};

module.exports = { getToken };
