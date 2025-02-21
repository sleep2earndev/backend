const axios = require('axios');
const { ReclaimClient } = require('@reclaimprotocol/zk-fetch');
const { transformForOnchain, verifyProof } = require('@reclaimprotocol/js-sdk');


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

// const sleepLog = async (token, parameter) => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = today.getMonth()+1;
//     const date = today.getDate() + 1;

//     const beforeDate = `${year}-${month}-${date}`
//     return axios.get(
//         'https://api.fitbit.com/1.2/user/-/sleep/list.json',
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 accept: 'application/json'
//             },
//             params: {
//                 sort: parameter.sort,
//                 limit: parameter.limit,
//                 offset: parameter.offset,
//                 beforeDate: beforeDate
//             }
//         }
//     ).then((res) => {
//         return res.data;
//     }).catch((error) => {
//         return {
//             message: "Request to Fitbit API failed",
//             error: error.response ? error.response.data : error.message,
//         }
//     })
// }

const sleepLog = async (data) => {
    return data.proof
}

const profile = async (data) => {
    return data.proof.proofUserData
}
const generateProof = async (token, date) => {
    // const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);

    // const today = new Date();
    // const year = today.getFullYear();
    // const month = today.getMonth()+1;
    // const date = today.getDate() + 1;

    // const beforeDate = `${year}-${month}-${date}`;

    // const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';
    // const urlSleepLog = `https://api.fitbit.com/1.2/user/-/sleep/list.json?sort=${parameter.sort}&limit=${parameter.limit}&offset=${parameter.offset}&beforeDate=${beforeDate}`;


    // const publicOptions = {
    //     method: 'GET',
    //     headers: {
    //         accept: 'application/json'
    //     }
    // };

    // const regexPatternUser = [
    //     { 
    //         type: 'regex', 
    //         value: '"displayName"\\s*:\\s*"?(?<displayName>[^",}]*)"?' 
    //     },
    //     { 
    //         type: 'regex', 
    //         value: '"fullName"\\s*:\\s*"?(?<fullName>[^",}]*)"?' 
    //     }
    // ];

    // const regexPatternSleep = [
    //     {
    //         type: 'regex',
    //         value: '"sleep"\\s*:\\s*\\[(?<sleep>.*?)\\]'
    //     }
    // ];
    
    

    // const privateOptions = {
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //         accept: 'application/json'
    //     },
    //     responseMatches: regexPatternUser
    // };
    // const privateOptionsSleep = {
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //         accept: 'application/json'
    //     },
    //     responseMatches: regexPatternSleep
    // };

    // try {
    //     const proofUser = await client.zkFetch(urlProfile, publicOptions, privateOptions);
    //     const proofSleepLog = await client.zkFetch(urlSleepLog, publicOptions, privateOptionsSleep);

    //     // console.log("Proof User Response:", proofUser.extractedParameterValues);
    //     // console.log("Proof Sleep Log Response:", proofSleepLog);

    //     const verifyProofUser = await verifyProof(proofUser);
    //     const verifyProofSleepLog = await verifyProof(proofSleepLog);

    //     // console.log("verify prof:",verifyProofUser)

    //     if (!verifyProofUser || !verifyProofSleepLog  ) {
    //         throw new Error('Proof verification failed');
    //     }

    //     const proofUserData = transformForOnchain(proofUser);
    //     const proofSleepLogData = transformForOnchain(proofSleepLog);

    //     return { proofUserData, proofSleepLogData };
    // } catch (error) {
    //     console.error('Error generating proof:', error.message || error);
    //     throw new Error('Failed to generate user proof');
    // }
    
    const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);

    const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';
    const urlSleepDateLog = `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`;


    const publicOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };

    const regexPatternUser = [
        {
            type: 'regex',
            value: '"displayName"\\s*:\\s*"?(?<displayName>[^",}]*)"?'
        },
        {
            type: 'regex',
            value: '"fullName"\\s*:\\s*"?(?<fullName>[^",}]*)"?'
        }
    ];

    const regexPatternSleep = [
        {
            type: 'regex',
            value: '"sleep"\\s*:\\s*\\[(?<sleep>.*?)\\]'
            // value:'"sleep"\s*:\s*\[\s*(?<sleep>[\s\S]*?)\]\s*(?=,\s*"[^"]+"\s*:|})'
            
        }
    ];


    const privateOptions = {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json'
        },
        responseMatches: regexPatternUser
    };
    const privateOptionsSleep = {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json'
        },
        responseMatches: regexPatternSleep
    };

    try {
        const proofUser = await client.zkFetch(urlProfile, publicOptions, privateOptions);
        const proofSleepDateLog = await client.zkFetch(urlSleepDateLog, publicOptions, privateOptionsSleep);

        // console.log("Proof User Response:", proofUser.extractedParameterValues);
        // console.log("Proof Sleep Log Response:", proofSleepLog);

        const verifyProofUser = await verifyProof(proofUser);
        const verifyProofSleep = await verifyProof(proofSleepDateLog);

        // console.log("verify prof:",verifyProofUser)

        if (!verifyProofUser || !verifyProofSleep) {
            throw new Error('Proof verification failed');
        }

        const proofUserData = transformForOnchain(proofUser);
        const proofSleepData = transformForOnchain(proofSleepDateLog);

        return { proofUserData, proofSleepData };
        // Object.assign(req, { proof: {
        //     proofUserData, proofSleepData
        // } });
        // next();
    } catch (error) {
        console.error('Error generating proof:', error.message || error);
        throw new Error('Failed to generate user proof');
    }
};


// module.exports = { generateToken, sleepLog, generateProof, profile};
module.exports = { generateToken, sleepLog, profile};
