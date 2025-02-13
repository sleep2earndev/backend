const model = require('../model/UserModel')
const authMidlleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] ? req.headers['authorization'].split('Bearer ') : req.cookies.access_token;
        if (!authHeader) {
            return res
                .status(401)
                .json({ message: "Invalid request or no token received" });
        }

        const result = await model.getProfile(authHeader)
        Object.assign(req, { user: result });
        next()
    } catch (err) {
        console.error("Error in getToken:", err);
        res.status(err.status || 500).json({
            message: err.message || "Something went wrong",
            error: err.error || null,
        });
    }
}


module.exports = { authMidlleware }