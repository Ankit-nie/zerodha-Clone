const nodemailer = require("nodemailer");

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const emailPass = process.env.EMAIL_PASS
    ? process.env.EMAIL_PASS.replace(/\s+/g, "")
    : "";

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const sendLoginEmail = async ({ to, username, isSignup = false }) => {
  const transporter = createTransporter();
  const recipient = to ? to.trim() : "";

  if (!transporter) {
    console.log(
      "[TradeX Mail] EMAIL_USER or EMAIL_PASS missing in Backend/.env — skipping email."
    );
    return { sent: false, reason: "missing_env_credentials" };
  }

  if (!recipient) {
    console.log("[TradeX Mail] Recipient email is empty — skipping email.");
    return { sent: false, reason: "missing_recipient" };
  }

  const loginTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const displayName = username || recipient.split("@")[0] || "Trader";
  const senderEmail = process.env.EMAIL_USER.trim();

  const subject = isSignup
    ? "Welcome to TradeX — Account Created & Signed In"
    : "TradeX Login Alert — Successful Sign-In";

  const heading = isSignup
    ? "Welcome to TradeX!"
    : "TradeX Login Alert";

  const bodyLine = isSignup
    ? "Your TradeX account has been created and you are now logged in successfully."
    : "Your TradeX account was just signed in successfully.";

  const mailOptions = {
    from: `"TradeX" <${senderEmail}>`,
    replyTo: senderEmail,
    to: recipient,
    subject,
    text: `Hi ${displayName},\n\n${bodyLine}\n\nAccount: ${recipient}\nTime: ${loginTime} (IST)\nPlatform: TradeX Web Dashboard\n\nIf this was not you, please change your password immediately.\n\n— Team TradeX`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 4px; padding: 24px; color: #464646;">
        <h2 style="margin: 0 0 12px 0; font-weight: 400; color: #387ed1; font-size: 20px;">${heading}</h2>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
          Hi ${displayName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          ${bodyLine}
        </p>
        <div style="background: #f9f9f9; border-left: 3px solid #48c237; padding: 12px 16px; font-size: 13px; line-height: 1.7; margin-bottom: 18px;">
          <div><strong>Account:</strong> ${recipient}</div>
          <div><strong>Time:</strong> ${loginTime} (IST)</div>
          <div><strong>Platform:</strong> TradeX Web Dashboard</div>
        </div>
        <p style="font-size: 12px; color: #888; line-height: 1.5; margin: 0;">
          If this wasn't you, please log out from all sessions and update your password immediately.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(
    `[TradeX Mail] ${isSignup ? "Signup" : "Login"} email sent to ${recipient} | Accepted:`,
    info.accepted
  );
  return { sent: true, accepted: info.accepted };
};

module.exports = { sendLoginEmail };
