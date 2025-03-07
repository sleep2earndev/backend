const axios = require('axios');
const zktls = require('../utils/ZktlsPart')
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { json } = require('body-parser');
const prisma = new PrismaClient
const moment= require('moment');

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
        // console.log("token:", response.data)
        return response.data
    } catch (error) {
        console.error("Error from Fitbit API:", error.response ? error.response.data : error.message);
        throw error;
    };
}
const sleepLog = async (req) => {
    try {
        const regexPatterns = zktls.getRegexPatterns();
        const token = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
        const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };
        const privateOptionsSleep = {
            headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
            responseMatches: regexPatterns.sleep
        };

        const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.startDate}/${req.body.endDate}.json`;
        const proofSleepData = await zktls.fetchAndVerifyProof(urlSleepDateLog, publicOptions, privateOptionsSleep);

        // console.log("proofSleepData:", JSON.stringify(proofSleepData, null, 2)); // Debugging

        if (!proofSleepData) {
            throw new Error("Invalid proofSleepData: Missing claimInfo or context");
        }

        let sleepData = proofSleepData;
        // console.log("Type of proofSleepData:", typeof proofSleepData);
        if (!sleepData) {
            throw new Error("Missing required sleep data");
        }

        const dataUser = req.proof.proofUserData;

        const userOwner = dataUser.signedClaim.claim.owner || "Unknown User";
        const fullName = JSON.parse(dataUser.claimInfo.context).extractedParameters.fullName || "Unknown Full Name";
        const userClaimInfo = JSON.stringify(dataUser.claimInfo);
        // const userSignedClaim= JSON.stringify(userData.signedClaim);
        // const userSignatures= userData.signedClaim.claim.signatures;

        const startTime = String(JSON.parse(sleepData.claimInfo.context).extractedParameters.startTime);
       
        const duration = parseInt(JSON.parse(sleepData.claimInfo.context).extractedParameters.duration) / 3600000;
        const endTime = JSON.parse(sleepData.claimInfo.context).extractedParameters.endTime;
       
        const sleepClaimInfo = JSON.stringify(sleepData.claimInfo);
        const summary = String(JSON.parse(sleepData.claimInfo.context).extractedParameters.summary)
        const dateOfSleep = String(JSON.parse(sleepData.claimInfo.context).extractedParameters.dateOfSleep);
        // const signedClaimSleep= JSON.stringify(sleepData.signedClaim);
        // const sleepSignatures= sleepData.signedClaim.claim.signatures;
        const sleepOwner = sleepData.signedClaim.claim.owner || "Unknown sleep User";
        // const earnHours = Number(process.env.EARN_HOUR)
        // let countEarn = Math.round(duration * earnHours)
        // let earn;
        // const maxEarn = Number(process.env.MAX_EARNING)
        // if (countEarn > maxEarn) {
        //     earn = maxEarn
        // } else {
        //     earn = countEarn
        // }
        await prisma.userApps.upsert({
            where: {
                owner: userOwner  //ini cari data ownernyanya dlu
            },
            update: {}, //jika ada ignore ae
            create: {
                owner: userOwner,
                fullName: fullName,
                claimInfo: userClaimInfo,
                // signedClaim:userSignedClaim,
                // signatures:userSignatures
            }

        })
        // console.log("Req ID before insert:", req.user.user_id);

        await prisma.sleepData.upsert({
            where: {
                startTime: startTime,
                // duration:duration,
                endTime: endTime
            },
            update: {},
            create: {
                dateOfSleep: dateOfSleep,
                startTime: startTime,
                summary: summary,
                version: "ONE",
                userId: req.user.user_id,
                duration: duration,
                endTime: endTime,
                claimInfo: sleepClaimInfo,
                // signedClaim:signedClaimSleep,
                // signatures:sleepSignatures,
                ownersleep: sleepOwner
                // earning: earn
            }
        })

        await prisma.totalEarning.upsert({
            where: {
                userId: req.user.user_id
            },
            update: {
                totalEarn: {
                    increment: earn
                }
            },
            create: {
                userId: req.user.user_id,
                totalEarn: earn
            }
        })

        return { success: true, user: dataUser, sleep: proofSleepData };
    } catch (error) {
        console.error("Error inserting sleep data:", error);
        return { success: false, error: error.message };
    }
};


const profile = async (data) => {
    return data.proof.proofUserData
}

const sleepLog2 = async (req) => {
    try {
        //get api from fitbit
        const regexPatterns = zktls.getRegexPatterns();
        const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };
        const token = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
        const privateOptionsSleep = {
            headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
            responseMatches: regexPatterns.sleep
        };

        const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.startDate}/${req.body.endDate}.json`;
        let proofSleepData = await zktls.fetchAndVerifyProof(urlSleepDateLog, publicOptions, privateOptionsSleep);

        if (!proofSleepData) {
            throw new Error("Invalid proofSleepData: Missing claimInfo or context");
        }

        let sleepData = proofSleepData;
        // console.log("sleep extract:", sleepData)
        
        if (!sleepData) {
            throw new Error("Missing required sleep data");
        }

        //breakdown result api fitbit for user
        const dataUser = req.proof.proofUserData;
        const fullName = JSON.parse(dataUser.claimInfo.context).extractedParameters.fullName || "Unknown Full Name";
        const userClaimInfo = JSON.stringify(dataUser.claimInfo);

        //breakdown result api fitbit for sleep by range
        const extractedParameters = JSON.parse(sleepData.claimInfo.context).extractedParameters;
       //convert context from zk which is regex into json to access it
        const sleepArray = JSON.parse(extractedParameters.sleep);
        // console.log("Parsed sleep data:", sleepArray); // Debugging
        const sleepResponse = Array.isArray(sleepArray) ? sleepArray : [sleepArray];

        //filter array by start time and end time
        const convertStartTime = moment(`${req.body.startDate} ${req.body.startTime}`, 'YYYY-MM-DD HH:mm:ss')
            .format('YYYY-MM-DDTHH:mm:ss.SSS')
        const convertEndTime = moment(`${req.body.endDate} ${req.body.endTime}`, 'YYYY-MM-DD HH:mm:ss')
            .format('YYYY-MM-DDTHH:mm:ss.SSS')
        // console.log("log start end:", convertStartTime,' ',convertEndTime)
        const response = sleepResponse
            .filter(({startTime,endTime})=>{
                const start= startTime
                const end= endTime
                return start>=convertStartTime && end <=convertEndTime
            })
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); 
        const newResponse = response[0];
        // console.log("Data sleep terbaru:", newResponse);

        //breakdown data which will be insert on table sleep
        const formatStartTime = moment(newResponse.startTime).format("HH:mm");
        const duration = newResponse.duration / 3600000;
        const formatEndTime = moment(newResponse.endTime).format("HH:mm");
        const sleepClaimInfo = JSON.stringify(sleepData.claimInfo);
        const summary = String(JSON.parse(sleepData.claimInfo.context).extractedParameters.summary)
        const dateOfSleep = newResponse.dateOfSleep;
        const logId = BigInt(newResponse.logId)
        const sleepOwner = sleepData.signedClaim.claim.owner || "Unknown sleep User";
        
        //crosscheck is json of newvalue 
        const isValidJson = (str) => {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }
        };
        if (isValidJson(JSON.stringify(newResponse))) {
            sleepData.claimInfo.context = newResponse; //change new value on context of this response api(to be json)
        } else {
            throw new Error("Invalid JSON format for newResponse");
        }

        //validation existing data sleep on db by log id
        const existingLog = await prisma.sleepData.findUnique({
            where: {
                logId: logId
            }
        });
        // if data is exist on db 
        if (existingLog) {
            return {
                success: false,
                message: "already achieve reward",
                earn: 0
            };
        }

        //validation data user 
        const existingUserApp = await prisma.userApps.findUnique({
            where: { owner: req.user.user_id }
        });
        //if user not exist on table user
        if (!existingUserApp) {
            console.log(`User not found. Inserting new record.`);
            await prisma.userApps.create({
                data: {
                    owner: req.user.user_id,
                    fullName: fullName,
                    claimInfo: userClaimInfo
                }
            });
        } else {
            console.log(`User already exists. Skipping insert.`);
        }


        // console.log("Req ID before insert:", req.user.user_id);

        //count of earn
        const earnHours = Number(process.env.EARN_HOUR)
        let countEarn = duration * earnHours
        let earn;
        const maxEarn = Number(process.env.MAX_EARNING)
        if (countEarn > maxEarn) {
            earn = maxEarn
        } else {
            earn = countEarn
        }

        //insert data on sleep table if not exist on table sleep by logid
        await prisma.sleepData.upsert({
            where: {
                logId: logId
            },
            update: {},
            create: {
                dateOfSleep: dateOfSleep,
                startTime: formatStartTime,
                summary: summary,
                version: "TWO",
                userId: req.user.user_id,
                duration: duration,
                endTime: formatEndTime,
                claimInfo: sleepClaimInfo,
                logId: logId,
                ownersleep: sleepOwner,
                earning: earn
            }
        })

        //insert into table totalCount for leaderboard feature
        await prisma.totalEarning.upsert({
            where: {
                userId: req.user.user_id
            },
            update: {
                totalEarn: {
                    increment: earn
                }
            },
            create: {
                userId: req.user.user_id,
                totalEarn: earn,
                fullName: fullName
            }
        })

        return {
            success: true,
            earn: earn,
            user: dataUser, sleep: proofSleepData
        };
    } catch (error) {
        console.error("Error inserting sleep data:", error);
        return { success: false, error: error.message };
    }
};

const leaderboard= async()=>{
    try{
        const data= await prisma.totalEarning.findMany({
            take:10,
            orderBy:{
                totalEarn:'desc'
            }
        })
        return data;
    }catch(error){
        console.error("Error get data leaderboard:", error);
        return { success: false, error: error.message };
    }
}
module.exports = { generateToken, sleepLog, profile, sleepLog2,leaderboard };

