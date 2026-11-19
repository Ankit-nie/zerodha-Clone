const nodemailer = require("nodemailer");

const cleanEnv = (val) =>
  val ? val.trim().replace(/^["']|["']$/g, "").trim() : "";

const createTransporter = () => {
  const emailUser = cleanEnv(process.env.EMAIL_USER);
  const emailPass = cleanEnv(process.env.EMAIL_PASS).replace(/\s+/g, "");

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 10000,
  });
};

const getBrevoApiKey = () => {
  const rawBrevoKey = cleanEnv(process.env.BREVO_API_KEY);
  if (!rawBrevoKey) return { key: "", error: null };

  // Detect if an SMTP key (xsmtpsib-...) was pasted instead of an API v3 key (xkeysib-...)
  if (rawBrevoKey.startsWith("xsmtpsib-")) {
    return {
      key: "",
      error:
        "BREVO_API_KEY looks like an SMTP key (xsmtpsib-...) instead of a Brevo v3 API key (xkeysib-...)",
    };
  }

  const key = rawBrevoKey.startsWith("xkeysib-")
    ? rawBrevoKey
    : `xkeysib-${rawBrevoKey}`;

  return { key, error: null };
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: controller.signal,
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
  } finally {
    clearTimeout(timer);
  }
};

const sendLoginEmail = async ({ to, username, isSignup = false }) => {
  const recipient = cleanEnv(to);
  const senderEmail = cleanEnv(process.env.EMAIL_USER);
  const { key: brevoApiKey, error: brevoKeyFormatError } = getBrevoApiKey();

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

  const heading = isSignup ? "Welcome to TradeX!" : "TradeX Login Alert";

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

  let brevoError = brevoKeyFormatError;

  // 1. Try Brevo HTTPS API first (works even when SMTP ports are blocked)
  if (brevoApiKey) {
    try {
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
    } catch (err) {
      brevoError = err.message;
      console.error(
        `[TradeX Mail] Brevo failed (${err.message}) — attempting Gmail SMTP fallback...`
      );
    }
  } else if (brevoKeyFormatError) {
    console.error(`[TradeX Mail] ${brevoKeyFormatError}`);
  }

  // 2. Fallback: Gmail SMTP via Nodemailer
  const transporter = createTransporter();
  if (!transporter) {
    const reason = brevoError || "BREVO_API_KEY and EMAIL_PASS missing";
    console.error(`[TradeX Mail] Email not sent: ${reason}`);
    return { sent: false, reason, brevoError };
  }

  try {
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
    return {
      sent: true,
      provider: "smtp",
      accepted: info.accepted,
      ...(brevoError ? { brevoFallbackReason: brevoError } : {}),
    };
  } catch (smtpErr) {
    console.error(
      `[TradeX Mail] Gmail SMTP failed for ${recipient}:`,
      smtpErr.message
    );
    return {
      sent: false,
      provider: "none",
      brevoError: brevoError || null,
      smtpError: smtpErr.message,
    };
  }
};

const checkMailStatus = async () => {
  const senderEmail = cleanEnv(process.env.EMAIL_USER);
  const { key: brevoApiKey, error: brevoKeyFormatError } = getBrevoApiKey();
  const hasEmailPass = Boolean(cleanEnv(process.env.EMAIL_PASS));

  const status = {
    senderConfigured: Boolean(senderEmail),
    brevoConfigured: Boolean(brevoApiKey),
    smtpConfigured: Boolean(senderEmail && hasEmailPass),
    brevo: { ok: false, detail: brevoKeyFormatError || "not configured" },
    smtp: { ok: false, detail: "not configured" },
  };

  if (brevoApiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch("https://api.brevo.com/v3/account", {
          signal: controller.signal,
          headers: { accept: "application/json", "api-key": brevoApiKey },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          status.brevo = { ok: true, detail: `connected (${data.email || "ok"})` };
        } else {
          status.brevo = {
            ok: false,
            detail: `HTTP ${res.status}: ${data.message || res.statusText}`,
          };
        }
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      status.brevo = { ok: false, detail: err.message };
    }
  }

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.verify();
      status.smtp = { ok: true, detail: "connected" };
    } catch (err) {
      status.smtp = { ok: false, detail: err.message };
    }
  }

  return status;
};

module.exports = { sendLoginEmail, checkMailStatus };
