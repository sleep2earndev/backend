const axios = require('axios');
const zktls = require('../utils/ZktlsPart')
require('dotenv').config();
const generateToken = async (code) => {
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

const sleepLog = async (req) => {
    const regexPatterns = zktls.getRegexPatterns();
    const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };
    const privateOptionsSleep = {
        headers: { Authorization: `${req.headers.authorization}`, accept: 'application/json' },
        responseMatches: regexPatterns.sleep
    };
    const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.startDate}/${req.body.endDate}.json`;
    proofSleepData = await zktls.fetchAndVerifyProof(urlSleepDateLog, publicOptions, privateOptionsSleep);
    const result= {
        user:req.proof.proofUserData,
        sleep:proofSleepData
    }
    return result
}

const profile = async (data) => {
    return data.proof.proofUserData
}


module.exports = { generateToken, sleepLog, profile };