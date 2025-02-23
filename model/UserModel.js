const axios = require('axios');
const zktls = require('../utils/ZktlsPart')

const command = require('../database/ConnectDb')

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
    try {
        const regexPatterns = zktls.getRegexPatterns();
        const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };
        const privateOptionsSleep = {
            headers: { Authorization: `${req.headers.authorization}`, accept: 'application/json' },
            responseMatches: regexPatterns.sleep
        };

        const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.startDate}/${req.body.endDate}.json`;
        const proofSleepData = await zktls.fetchAndVerifyProof(urlSleepDateLog, publicOptions, privateOptionsSleep);

        // console.log("proofSleepData:", JSON.stringify(proofSleepData, null, 2)); // Debugging

        if (!proofSleepData) {
            throw new Error("Invalid proofSleepData: Missing claimInfo or context");
        }

        let extractedParams = {};
        try {
            extractedParams = JSON.parse(proofSleepData.claimInfo.context).extractedParameters;
        } catch (parseError) {
            throw new Error("Error parsing extractedParameters: " + parseError.message);
        }

        if (!extractedParams.dateOfSleep || !extractedParams.duration || !extractedParams.endTime || !extractedParams.levels) {
            throw new Error("Missing required sleep data in extractedParameters");
        }

        const userData = req.proof.proofUserData;
        let userExtractedParams = {};
        try {
            userExtractedParams = JSON.parse(userData.claimInfo.context).extractedParameters;
        } catch (parseError) {
            throw new Error("Error parsing user extractedParameters: " + parseError.message);
        }

        const displayName = userExtractedParams.displayName || "Unknown User";
        const fullName = userExtractedParams.fullName || "Unknown Full Name";
        const avatar = userExtractedParams.avatar || "No Avatar";

        const dateOfSleep = extractedParams.dateOfSleep;
        const duration = parseInt(extractedParams.duration, 10);
        const endTime = extractedParams.endTime;
        const levels = JSON.stringify({ data: extractedParams.levels });

        const claimInfoSleep = JSON.stringify(proofSleepData.claimInfo);
        const signedClaimSleep = JSON.stringify(proofSleepData.signedClaim);

        const insertUserQuery = `
    INSERT INTO userSleep2earn (display_name, full_name, avatar, claim_info, signed_claim)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (full_name) DO NOTHING;
`;
        await command.db.query(insertUserQuery, [displayName, fullName, avatar, claimInfoSleep, signedClaimSleep]);

        const insertSleepQuery = `
    INSERT INTO sleepData (user_full_name, date_of_sleep, duration, end_time, levels, claim_info, signed_claim)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_full_name, date_of_sleep) DO NOTHING RETURNING *;
`;
        await command.db.query(insertSleepQuery, [
            fullName,
            dateOfSleep,
            duration,
            endTime,
            levels,
            claimInfoSleep,
            signedClaimSleep
        ]);

        return { success: true, user: userData, sleep: proofSleepData };
    } catch (error) {
        console.error("Error inserting sleep data:", error);
        return { success: false, error: error.message };
    }
};




const profile = async (data) => {
    return data.proof.proofUserData
}

module.exports = { generateToken, sleepLog, profile };