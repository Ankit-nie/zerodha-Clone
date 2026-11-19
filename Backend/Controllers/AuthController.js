
const User = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const { sendLoginEmail } = require("../util/SendEmail");
const bcrypt = require("bcryptjs");

// SIGNUP
module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await User.create({
      email,
      password,
      username,
      createdAt,
    });

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // Send Welcome + Login alert email on Signup (with automatic SMTP fallback)
    let emailStatus = { sent: false };
    try {
      emailStatus = await sendLoginEmail({
        to: user.email,
        username: user.username,
        isSignup: true,
      });
    } catch (mailErr) {
      console.error("[TradeX Mail] Failed to send signup email:", mailErr.message);
      emailStatus = { sent: false, error: mailErr.message };
    }

    return res.status(201).json({
      message: "User signed up successfully",
      success: true,
      emailAlert: Boolean(emailStatus.sent),
      emailStatus,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// LOGIN
module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const auth = await bcrypt.compare(password, user.password);

    if (!auth) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // Send Login alert email (Brevo with automatic Gmail SMTP fallback)
    let emailStatus = { sent: false };
    try {
      emailStatus = await sendLoginEmail({
        to: user.email,
        username: user.username,
      });
    } catch (mailErr) {
      console.error("[TradeX Mail] Failed to send login email:", mailErr.message);
      emailStatus = { sent: false, error: mailErr.message };
    }

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      emailAlert: Boolean(emailStatus.sent),
      emailStatus,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
