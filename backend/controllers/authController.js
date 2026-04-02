import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

/* ================= JWT ================= */
function createToken(user) {
  return jwt.sign(
    {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role, // ✅ ROLE INCLUDED
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ================= EMAIL ================= */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/* =========================================================
   SIGNUP
   ========================================================= */
export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === "doctor" ? "doctor" : "user", // ✅ ROLE LOGIC
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    const transporter = createTransporter();

    const verifyLinkBackend = `http://localhost:${
      process.env.PORT || 5000
    }/api/auth/verify-email/${verificationToken}`;

    const verifyLinkFrontend = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your RetinaCare AI account",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for signing up to <b>RetinaCare AI</b>.</p>
        <p>Please verify your email address:</p>
        <p>
          <a href="${verifyLinkFrontend}"
             style="padding:10px 16px;background:#0ea5e9;color:#fff;
                    text-decoration:none;border-radius:6px;">
             Verify Email
          </a>
        </p>
        <p>Or use this link:</p>
        <p>${verifyLinkBackend}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });

    const token = createToken(user);

    return res.json({
      msg: "Signup successful. Please verify your email.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ RETURN ROLE
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error during signup" });
  }
}

/* =========================================================
   LOGIN
   ========================================================= */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email & password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ msg: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ msg: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(403).json({
        msg: "Please verify your email address before logging in.",
      });
    }

    const token = createToken(user);

    return res.json({
      msg: "Login successful",
      token,
      role: user.role, // ✅ FRONTEND USES THIS
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
}

/* =========================================================
   VERIFY EMAIL
   ========================================================= */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ msg: "Token is required" });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.json({
      msg: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ msg: "Server error during email verification" });
  }
}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        msg: "If a user with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();

    const transporter = createTransporter();
    const resetLinkFrontend = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your RetinaCare AI password",
      html: `
        <p>Hi ${user.name},</p>
        <p>Reset your password:</p>
        <a href="${resetLinkFrontend}"
           style="padding:10px 16px;background:#0ea5e9;color:#fff;
                  text-decoration:none;border-radius:6px;">
           Reset Password
        </a>
      `,
    });

    return res.json({
      msg: "If a user with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error during forgot password" });
  }
}

/* =========================================================
   RESET PASSWORD
   ========================================================= */
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password)
      return res.status(400).json({ msg: "Invalid request" });

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ msg: "Invalid or expired reset token." });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      msg: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
}
