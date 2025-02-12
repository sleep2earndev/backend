const model = require("../model/UserModel");

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
    console.log('token:',access_token,'refresh:', refresh_token)
    res.cookie("access_token", access_token, { 
      httpOnly: true,
      secure: true, // Wajib pakai HTTPS
      sameSite: "Lax", // Cukup untuk subdomain
      domain: ".syaad.dev",
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    });
    
    res.cookie("refresh_token", refresh_token, { 
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      domain: ".syaad.dev",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    })
    
    res.redirect("https://snoorefi.syaad.dev");

  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null
    });
  }
}

module.exports = { auth, redirectURi };
