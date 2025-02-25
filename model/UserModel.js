const axios = require('axios');
const zktls = require('../utils/ZktlsPart')
require('dotenv').config();
// const command = require('../database/ConnectDb')
const {PrismaClient}= require('@prisma/client')
const prisma= new PrismaClient

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

        let sleepData = {};
        try {
            sleepData = JSON.parse(proofSleepData);
        } catch (parseError) {
            throw new Error("Error parsing sleep data: " + parseError.message);
        }

        if (!sleepData) {
            throw new Error("Missing required sleep data");
        }

        const dataUser = req.proof.proofUserData;
        let  userData= {};
        try {
            userData = JSON.parse(dataUser);
        } catch (parseError) {
            throw new Error("Error parsing user datas: " + parseError.message);
        }

        const userOwner = userData.signedClaim.claim.owner || "Unknown User";
        const fullName = userData.claimInfo.context.extractedParameters.fullName || "Unknown Full Name";
        const userClaimInfo= JSON.stringify(userData.claimInfo);
        // const userSignedClaim= JSON.stringify(userData.signedClaim);
        // const userSignatures= userData.signedClaim.claim.signatures;

        const dateOfSleep = sleepData.dateOfSleep;
        const duration = parseInt(sleepData.duration)/60000;
        const endTime = sleepData.endTime;
        const sleepClaimInfo= JSON.stringify(sleepData.claimInfo);
        // const signedClaimSleep= JSON.stringify(sleepData.signedClaim);
        // const sleepSignatures= sleepData.signedClaim.claim.signatures;
        const sleepOwner = sleepData.signedClaim.claim.owner || "Unknown sleep User";

        await prisma.userApps.upsert({
            where:{
                owner:userOwner  //ini cari data ownernyanya dlu
            },
            update:{}, //jika ada ignore ae
            create:{
                owner:userOwner,
                fullName:fullName,
                claimInfo:userClaimInfo,
                // signedClaim:userSignedClaim,
                // signatures:userSignatures
            }

        })
        await prisma.sleepData.upsert({
            where:{
                dateOfSleep:dateOfSleep,
                duration:duration,
                endTime:endTime
            },
            update:{},
            create:{
                dateOfSleep:dateOfSleep,
                duration:duration,
                endTime:endTime,
                claimInfo:sleepClaimInfo,
                // signedClaim:signedClaimSleep,
                // signatures:sleepSignatures,
                ownersleep:sleepOwner
            }
        })
        // const claimInfoSleep = JSON.stringify(proofSleepData.claimInfo);
        // const signedClaimSleep = JSON.stringify(proofSleepData.signedClaim);



//         const insertUserQuery = `
//     INSERT INTO userSleep2earn (display_name, full_name, avatar, claim_info, signed_claim)
//     VALUES ($1, $2, $3, $4, $5)
//     ON CONFLICT (full_name) DO NOTHING;
// `;
//         await command.db.query(insertUserQuery, [displayName, fullName, avatar, claimInfoSleep, signedClaimSleep]);

//         const insertSleepQuery = `
//     INSERT INTO sleepData (user_full_name, date_of_sleep, duration, end_time, levels, claim_info, signed_claim)
//     VALUES ($1, $2, $3, $4, $5, $6, $7)
//     ON CONFLICT (user_full_name, date_of_sleep) DO NOTHING RETURNING *;
// `;
//         await command.db.query(insertSleepQuery, [
//             fullName,
//             dateOfSleep,
//             duration,
//             endTime,
//             levels,
//             claimInfoSleep,
//             signedClaimSleep
//         ]);

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