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

const sendViaBrevo = async ({
  apiKey,
  senderEmail,
  recipient,
  displayName,
  subject,
  text,
  html,
}) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "TradeX",
        email: senderEmail,
      },
      replyTo: {
        name: "TradeX",
        email: senderEmail,
      },
      to: [
        {
          email: recipient,
          name: displayName,
        },
      ],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Brevo API error (${response.status}): ${data.message || response.statusText}`
    );
  }

  return data;
};

const sendLoginEmail = async ({ to, username, isSignup = false }) => {
  const recipient = to ? to.trim() : "";
  const senderEmail = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const rawBrevoKey = process.env.BREVO_API_KEY
    ? process.env.BREVO_API_KEY.trim()
    : "";
  const brevoApiKey =
    rawBrevoKey && !rawBrevoKey.startsWith("xkeysib-")
      ? `xkeysib-${rawBrevoKey}`
      : rawBrevoKey;

  if (!recipient) {
    console.log("[TradeX Mail] Recipient email is empty — skipping email.");
    return { sent: false, reason: "missing_recipient" };
  }

  if (!senderEmail) {
    console.log(
      "[TradeX Mail] EMAIL_USER missing in environment — skipping email."
    );
    return { sent: false, reason: "missing_sender" };
  }

  const loginTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const displayName = username || recipient.split("@")[0] || "Trader";

  const subject = isSignup
    ? "Welcome to TradeX — Account Created & Signed In"
    : "TradeX Login Alert — Successful Sign-In";

  const heading = isSignup
    ? "Welcome to TradeX!"
    : "TradeX Login Alert";

  const bodyLine = isSignup
    ? "Your TradeX account has been created and you are now logged in successfully."
    : "Your TradeX account was just signed in successfully.";

  const text = `Hi ${displayName},\n\n${bodyLine}\n\nAccount: ${recipient}\nTime: ${loginTime} (IST)\nPlatform: TradeX Web Dashboard\n\nIf this was not you, please change your password immediately.\n\n— Team TradeX`;

  const html = `
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
    `;

  // Prefer Brevo HTTPS API (works on Render free tier where SMTP ports are blocked)
  if (brevoApiKey) {
    const result = await sendViaBrevo({
      apiKey: brevoApiKey,
      senderEmail,
      recipient,
      displayName,
      subject,
      text,
      html,
    });
    console.log(
      `[TradeX Mail] ${isSignup ? "Signup" : "Login"} email sent via Brevo to ${recipient} | MessageId:`,
      result.messageId
    );
    return { sent: true, provider: "brevo", messageId: result.messageId };
  }

  // Local fallback: Gmail SMTP via Nodemailer
  const transporter = createTransporter();
  if (!transporter) {
    console.log(
      "[TradeX Mail] BREVO_API_KEY and EMAIL_PASS missing — skipping email."
    );
    return { sent: false, reason: "missing_env_credentials" };
  }

  const mailOptions = {
    from: `"TradeX" <${senderEmail}>`,
    replyTo: senderEmail,
    to: recipient,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(
    `[TradeX Mail] ${isSignup ? "Signup" : "Login"} email sent via SMTP to ${recipient} | Accepted:`,
    info.accepted
  );
  return { sent: true, provider: "smtp", accepted: info.accepted };
};

module.exports = { sendLoginEmail };
