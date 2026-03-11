const nodemailer = require("nodemailer");
const https = require("https");

const createTransport = (overridePass) => {
  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USER;
  const pass = overridePass || process.env.MAIL_PASS || process.env.BREVO_API_KEY;

  if (!host || !user || !pass) {
    throw new Error("MAIL_HOST, MAIL_USER, and MAIL_PASS (or BREVO_API_KEY) must be set");
  }

  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: { user, pass },
  });
};

const sendViaBrevoApi = ({ toEmail, subject, html, text, fromEmail, fromName }) =>
  new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      reject(new Error("BREVO_API_KEY is missing"));
      return;
    }

    const payload = JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
      textContent: text,
    });

    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "api-key": apiKey,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
            return;
          }
          reject(new Error(`Brevo API error: ${res.statusCode} ${body.slice(0, 300)}`));
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });

const sendEmail = async ({ toEmail, subject, html, text }) => {
  const fromEmail = process.env.MAIL_FROM || process.env.MAIL_USER;
  const fromName = process.env.MAIL_FROM_NAME || "Soul Pharma";

  const payload = {
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html,
  };

  try {
    const transporter = createTransport();
    await transporter.sendMail(payload);
    return;
  } catch (error) {
    console.error("SMTP send failed:", error?.message || error);
  }

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevoApi({ toEmail, subject, html, text, fromEmail, fromName });
    return;
  }

  throw new Error("No working email transport. Check SMTP or BREVO_API_KEY.");
};

module.exports = { sendEmail };
