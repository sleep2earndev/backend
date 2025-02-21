// const model = require('../model/UserModel')
const { ReclaimClient } = require('@reclaimprotocol/zk-fetch');
const { transformForOnchain, verifyProof } = require('@reclaimprotocol/js-sdk');


// const authMidlleware = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
//         if (!authHeader) {
//             return res
//                 .status(401)
//                 .json({ message: "Invalid request or no token received" });
//         }

//         const result = await model.getProfile(authHeader)
//         Object.assign(req, { user: result });
//         next()
//     } catch (err) {
//         console.error("Error in getToken:", err);
//         res.status(err.status || 500).json({
//             message: err.message || "Something went wrong",
//             error: err.error || null,
//         });
//     }
// }

// const middlewareProof = async (req, res, next) => {
//     try {
//         const token = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
//         if (!token) {
//             return res
//                 .status(401)
//                 .json({ message: "Invalid request or no token received" });
//         }

//         const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);

//         let proofUserData; 
//         let proofSleepData;
//         const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';
//         const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.date}.json`;

//         try{
//             const regexPatternUser = [
//                 { 
//                     type: 'regex', 
//                     value: '"displayName"\\s*:\\s*"?(?<displayName>[^",}]*)"?' 
//                 },
//                 { 
//                     type: 'regex', 
//                     value: '"fullName"\\s*:\\s*"?(?<fullName>[^",}]*)"?' 
//                 },
//                 { 
//                     type: 'regex', 
//                     value: '"avatar"\\s*:\\s*"?(?<avatar>[^",}]*)"?' 
//                 }
//             ];

//             const regexPatternSleep = [
//                 {
//                     type: 'regex',
//                     value: '"sleep"\\s*:\\s*\\[(?<sleep>.*?)\\]'
//                     // value:'"sleep"\s*:\s*\[\s*(?<sleep>[\s\S]*?)\]\s*(?=,\s*"[^"]+"\s*:|})'

//                 }
//             ];

//             const publicOptions = {
//                 method: 'GET',
//                 headers: {
//                     accept: 'application/json'
//                 }
//             };

//             const privateOptions = {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     accept: 'application/json'
//                 },
//                 responseMatches: regexPatternUser
//             };
//             const privateOptionsSleep = {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     accept: 'application/json'
//                 },
//                 responseMatches: regexPatternSleep
//             };

//             console.log("Request URL:", req.path);
//             console.log("Request Body:", req.body);

//             if(req.body.date == undefined && req.path == '/profile'){
//                 const proofUser = await client.zkFetch(urlProfile, publicOptions, privateOptions);
//                 const verifyProofUser = await verifyProof(proofUser);
//                  // console.log("Proof User Response:", proofUser.extractedParameterValues);
//                  console.log("Proof User Response:", proofUser);
//                  if (!verifyProofUser) {
//                     throw new Error('Proof verification user failed');
//                 }
//                 proofUserData = transformForOnchain(proofUser)
//             }

//             if(req.body.date && req.path =='/get-sleep'){
//                 const proofUser = await client.zkFetch(urlProfile, publicOptions, privateOptions);
//                 const verifyProofUser = await verifyProof(proofUser);
//                  // console.log("Proof User Response:", proofUser.extractedParameterValues);
//                  console.log("Proof User Response:", proofUser);
//                  if (!verifyProofUser) {
//                     throw new Error('Proof verification user failed');
//                 }
//                 proofUserData = transformForOnchain(proofUser)

//                 const proofSleepDateLog = await client.zkFetch(urlSleepDateLog, publicOptions, privateOptionsSleep);
//                 // console.log("Proof Sleep Log Response:", proofSleepLog);
//                 const verifyProofSleep = await verifyProof(proofSleepDateLog);

//                 if (!verifyProofSleep) {
//                     throw new Error('Proof verification sleep failed');
//                 }

//                proofSleepData = transformForOnchain(proofSleepDateLog)
//             }

//             Object.assign(req, { proof: {
//                 proofUserData, proofSleepData
//             } });
//             // console.log("assign proof:",req.proof)
//             next();
//         }catch (error) {
//             console.error('Error generating proof:', error.message || error);
//             throw new Error('Failed to generate user proof');
//         }
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(err.status || 500).json({
//             message: err.message || "Something went wrong",
//             error: err.error || null,
//         });
//     }
// }

const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);

const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';

const getRegexPatterns = () => ({
    user: [
        { type: 'regex', value: '"displayName"\\s*:\\s*"?(?<displayName>[^",}]*)"?' },
        { type: 'regex', value: '"fullName"\\s*:\\s*"?(?<fullName>[^",}]*)"?' },
        { type: 'regex', value: '"avatar"\\s*:\\s*"?(?<avatar>[^",}]*)"?' }
    ],
    sleep: [
        { type: 'regex', value: '"dateOfSleep"\\s*:\\s*"?(?<dateOfSleep>[^",}]*)"?' },
        { type: 'regex', value: '"duration"\\s*:\\s*"?(?<duration>[^",}]*)"?' },
        { type: 'regex', value: '"endTime"\\s*:\\s*"?(?<endTime>[^",}]*)"?' },
        { type: 'regex', value: '"levels"\\s*:\\s*{(?<levels>[^}]*)}' }
    ]
});

const fetchAndVerifyProof = async (url, publicOpts, privateOpts) => {
    try {
        const proof = await client.zkFetch(url, publicOpts, privateOpts);
        const isVerif = await verifyProof(proof);

        if (!isVerif) {
            throw new Error('Proof verification failed');
        }
        // console.log("proof:", proof)

        return transformForOnchain(proof);
    } catch (error) {
        console.error(`Error fetching proof from ${url}:`, error.message || error);
        throw new Error(`Failed to fetch proof for ${url}`);
    }
};

const middlewareProof = async (req, res, next) => {
    try {
        const token = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: "Invalid request or no token received" });
        }

        const regexPatterns = getRegexPatterns();
        const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };

        const privateOptionsUser = {
            headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
            responseMatches: regexPatterns.user
        };

        const privateOptionsSleep = {
            headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
            responseMatches: regexPatterns.sleep
        };

        let proofUserData = null;
        let proofSleepData = null;

        if (!req.body.startDate || !req.body.endDate && req.path === '/profile') {
            proofUserData = await fetchAndVerifyProof(urlProfile, publicOptions, privateOptionsUser);
        }

        if (req.body.startDate && req.body.endDate  && req.path === '/get-sleep') {
            const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${req.body.startDate}/${req.body.endDate}.json`;

            proofUserData = await fetchAndVerifyProof(urlProfile, publicOptions, privateOptionsUser);
            proofSleepData = await fetchAndVerifyProof(urlSleepDateLog, publicOptions, privateOptionsSleep);
        }

        Object.assign(req, { proof: { proofUserData, proofSleepData } });
        // console.log("req:", req.proof)

        return next();
    } catch (err) {
        console.error("Error in middlewareProof:", err.message || err);

        if (!res.headersSent) {
            return res.status(err.status || 500).json({
                message: err.message || "Something went wrong",
                error: err.error || null
            });
        }
    }
};




// module.exports = { authMidlleware, middlewareProof }
module.exports = { middlewareProof }