const model = require("../model/UserModel");

const getToken = async (req, res) => {
  try {
    console.log("Headers received in request[controller]:", req.headers);

    const result = await model.getToken(req.headers, req.body);

    if (!result) {
      return res.status(400).json({ message: "Invalid request or no token received" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getToken:", err); 

    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: err.error || null 
    });
  }
};

module.exports = { getToken };
