const { ReclaimClient } = require('@reclaimprotocol/zk-fetch');
const { transformForOnchain, verifyProof } = require('@reclaimprotocol/js-sdk');
require('dotenv').config();
const client = new ReclaimClient(process.env.ZK_APP_ID, process.env.ZK_SECRET, true);

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
        { type: 'regex', value: '"levels"\\s*:\\s*(?<levels>\{(?:[^{}]|"(?:\\.|[^"])*"|\{(?:[^{}]|"(?:\\.|[^"])*")*\})*\})' },
        { type: 'regex', value: '"summary"\\s*:\\s*(?<summary>\{(?:[^{}]|"(?:\\.|[^"])*"|\{(?:[^{}]|"(?:\\.|[^"])*")*\})*\})' },
        { type: 'regex', value: '"startTime"\\s*:\\s*"?(?<startTime>[^",}]*)"?' }
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

module.exports={getRegexPatterns,fetchAndVerifyProof}