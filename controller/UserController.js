const model = require("../model/UserModel");
require('dotenv').config();


const redirectURi = (req, res) => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=activity%20sleep%20profile`;
  res.redirect(authUrl);
}

const auth = async (req, res) => {

  try {
    const code = req.query.code
    if (!code) {
      return res.status(401).json({
        message: "authorization code is missing"
      });
    }

    const { access_token, refresh_token } = await model.authModel(code);
    if (!access_token || !refresh_token) {
      throw new Error("Failed to retrieve tokens from Fitbit API");
    }
    console.log('token:', access_token, 'refresh:', refresh_token)
    res.cookie("access_token", access_token, {
      httpOnly: process.env.HTTPONLY,
      secure: process.env.NODE_ENV === 'production', // Wajib pakai HTTPS
      sameSite: process.env.SAMESITE, // Cukup untuk subdomain
      domain: process.env.DOMAIN,
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: process.env.HTTPONLY,
      secure: process.env.NODE_ENV === 'production', // Wajib pakai HTTPS
      sameSite: process.env.SAMESITE, // Cukup untuk subdomain
      domain: process.env.DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    })

    res.redirect(process.env.COOKIE_URI);

  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

const getSleep = async (req, res) => {
  const parameter= req.query
  try {
    const token= req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1] : req.cookies.access_token;
    const result= await model.sleepLog(token,parameter)
    if(!result){
      res.status(401).json({
        message:'your sleep log is not found'
      })
    }

    res.status(200).json(result)
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

module.exports = { auth, redirectURi, getSleep };
