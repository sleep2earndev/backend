const { default: axios } = require("axios");
const model = require("../model/UserModel");
require('dotenv').config();


const redirectURi = (req, res) => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=activity%20sleep%20profile`;
  res.redirect(authUrl);
}

// let user_id;
const token = async (req, res) => {
  try {
    const code = req.query.code
    if (!code) {
      return res.status(401).json({
        message: "authorization code is missing"
      });
    }

    // const { access_token, refresh_token,  user_id} = await model.generateToken(code);
    const tokenData = await model.generateToken(code);
    // console.log("Full Token Data:", tokenData);

    const access_token = tokenData.access_token;
    const refresh_token = tokenData.refresh_token;
    const user_id = tokenData.user_id;


    // console.log("Extracted user_id:", user_id);
    // console.log('token:', access_token)
    if (!access_token || !refresh_token) {
      throw new Error("Failed to retrieve tokens from Fitbit API");
    }

    res.cookie("access_token", access_token, {
      httpOnly: process.env.HTTPONLY,
      secure: process.env.NODE_ENV === 'production', // Wajib pakai HTTPS
      sameSite: process.env.SAMESITE, // Cukup untuk subdomain
      domain: process.env.DOMAIN,
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    });

    // ini pas production aja
    res.cookie("call", user_id, {
      httpOnly: process.env.HTTPONLY,
      secure: process.env.NODE_ENV === 'production', // Wajib pakai HTTPS
      sameSite: process.env.SAMESITE, // Cukup untuk subdomain
      domain: process.env.DOMAIN,
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    });


    //ini buat pas tes local
    // res.cookie("call", user_id, {
    //   httpOnly: false,
    //   secure: false, // Gunakan HTTPS hanya di produksi
    //   sameSite: process.env.SAMESITE,
    //   // domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
    //   maxAge: 8 * 60 * 60 * 1000, // 8 jam
    // });
    
    // res.cookie("tokenLocal", access_token, {
    //   httpOnly: false,
    //   secure: false, // Gunakan HTTPS hanya di produksi
    //   sameSite: process.env.SAMESITE,
    //   // domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
    //   maxAge: 8 * 60 * 60 * 1000, // 8 jam
    // });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: process.env.HTTPONLY,
      secure: process.env.NODE_ENV === 'production', // Wajib pakai HTTPS
      sameSite: process.env.SAMESITE, // Cukup untuk subdomain
      domain: process.env.DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    })

    res.redirect(process.env.COOKIE_URI);

    //ini buat cookies local
    // res.redirect('http://localhost:4000/userID ')
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

const getEarn = async (req, res) => {
  try {
    const result = await model.sleepLog(req)
    if (!result) {
      res.status(401).json({
        message: 'your sleep log is not found'
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

const getEarn2 = async (req, res) => {
  try {
    const result = await model.sleepLog2(req)
    if (!result) {
      return res.status(401).json({
        message: 'your sleep log is not found'
      })
    } else if (result.success === false && result.error === "max energy is used") {  //handle negative case
      return res.status(400).json({
        message: 'insufient energy', //return insufient energy
      })
    };

    return res.status(200).json(result)
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

const getProfile = async (req, res) => {
  try {
    const result = await model.profile(req)
    if (!result) {
      res.status(401).json({
        message: 'your profile not found'
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

const leaderboard= async(req, res)=>{
  try{
    const result = await model.leaderboard()
    if(!result){
      res.status(401).json({
        message: 'leaderboard not found'
      })
    }

    res.status(200).json(result);
  }catch(err){
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

const chatWithCoach = async (req, res) => {
  try {
    if (!Array.isArray(req.body.messages)) {
      return res.status(422).json({
        message: "your messages is not valid",
      });
    }
    // console.log("body ai:", req.body.messages)
    const result = await axios.post(
      `${process.env.AI_BASE_URL}/v1/chat/completions`,
      {
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: req.body.messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("result:", result)
    if (!result.data) {
      return res.status(401).json({
        message: "your sleep log is not found",
      });
    }

    return res.status(200).json(result.data);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
};

const logout = async (req, res) => {
  try {
    const access_token = req.headers['authorization']
      ? req.headers['authorization'].split('Bearer ')[1]
      : req.cookies.access_token;

    if (!access_token) {
      return res.status(400).json({ message: "No token provided when logout" });
    }

    await axios.post(
      "https://api.fitbit.com/oauth2/revoke",
      new URLSearchParams({ token: access_token }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.clearCookie("access_token", {
      httpOnly: process.env.HTTPONLY === "true",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.SAMESITE,
      domain: process.env.DOMAIN
    });
    
    res.clearCookie("refresh_token", {
      httpOnly: process.env.HTTPONLY === "true",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.SAMESITE,
      domain: process.env.DOMAIN
    });
    res.clearCookie("call", {
      httpOnly: process.env.HTTPONLY === "true",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.SAMESITE,
      domain: process.env.DOMAIN
    });

    return res.status(200).json({
      message:"log out"
    })

  } catch (err) {
    return res.status(err.response?.status || 500).json({
      message: err.response?.data?.error_description || err.message || "Something went wrong",
      error: err.response?.data || null
    });
  }
};

module.exports = { token, redirectURi, getEarn, getProfile, getEarn2, leaderboard, chatWithCoach,logout };
