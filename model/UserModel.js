const axios = require('axios');
const { ReclaimClient } = require('@reclaimprotocol/zk-fetch');
const { transformForOnchain, verifyProof } = require('@reclaimprotocol/js-sdk');


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

const generateProof = async (token) => {
    const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);
    const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';

    const publicOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };
    const regexPattern = [
        { type: 'regex', value: '"age"\\s*:\\s*"?(?<age>[^",}]*)"?' },
        { type: 'regex', value: '"displayName"\\s*:\\s*"?(?<displayName>[^",}]*)"?' },
        { type: 'regex', value: '"encodedId"\\s*:\\s*"?(?<encodedId>[^",}]*)"?' },
        { type: 'regex', value: '"firstName"\\s*:\\s*"?(?<firstName>[^",}]*)"?' },
        { type: 'regex', value: '"height"\\s*:\\s*"?(?<height>[^",}]*)"?' },
        { type: 'regex', value: '"gender"\\s*:\\s*"?(?<gender>[^",}]*)"?' },
        { type: 'regex', value: '"timezone"\\s*:\\s*"?(?<timezone>[^",}]*)"?' },
        { type: 'regex', value: '"locale"\\s*:\\s*"?(?<locale>[^",}]*)"?' }
    ]

    const privateOptions = {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json'
        },
        responseMatches: regexPattern
    };

    try {

        const proofUser = await client.zkFetch(urlProfile, publicOptions, privateOptions);
        
        // console.log("Proof User Response:", proofUser);

        const verifyProofUser = await verifyProof(proofUser);
        if (!verifyProofUser) {
            throw new Error('Proof verification failed');
        }

        
        const proofUserData = transformForOnchain(proofUser);
        
        return { proofUserData };
    } catch (error) {
        console.error('Error generating proof:', error.message || error);
        throw new Error('Failed to generate user proof');
    }
};


module.exports = { authModel, getProfile, sleepLog, generateProof };
