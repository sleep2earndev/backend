const zktls= require('../utils/ZktlsPart')

const middlewareProofProfile = async (req, res, next) => {
    try {
        const token = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: "Invalid request or no token received" });
        }
        // console.log('token:', token)
        const urlProfile = 'https://api.fitbit.com/1/user/-/profile.json';

        const regexPatterns = zktls.getRegexPatterns();
        const publicOptions = { method: 'GET', headers: { accept: 'application/json' } };

        const privateOptionsUser = {
            headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
            responseMatches: regexPatterns.user
        };

        let proofUserData = await zktls.fetchAndVerifyProof(urlProfile, publicOptions, privateOptionsUser);
       
        Object.assign(req, { proof: { proofUserData } });
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

module.exports = { middlewareProofProfile }