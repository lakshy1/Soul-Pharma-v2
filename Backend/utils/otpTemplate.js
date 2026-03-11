const buildOtpEmail = ({
  code,
  purpose = "login",
  expiresMinutes = 10,
  brandName = "Soul Pharma",
  supportEmail = "Soulpharmangp@gmail.com",
}) => {
  const purposeLabel = {
    login: "sign in",
    signup: "create your account",
    reset: "reset your password",
  }[purpose] || "continue";

  const subject = `${brandName} OTP for ${purposeLabel}`;

  const text = [
    `${brandName} OTP`,
    "",
    `Your one-time password (OTP) is: ${code}`,
    `It expires in ${expiresMinutes} minutes.`,
    "",
    `Use this code to ${purposeLabel}.`,
    "",
    "If you did not request this, please ignore this email.",
    `Need help? Contact us at ${supportEmail}.`,
  ].join("\n");

  const html = `
  <div style="background:#f6f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="padding:20px 24px;background:linear-gradient(120deg,#d62839,#f97316);color:#ffffff;">
        <div style="font-size:18px;font-weight:700;letter-spacing:0.04em;">${brandName}</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px;">Secure access code</div>
      </div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 8px;font-size:20px;">Your OTP is ready</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
          Use this code to ${purposeLabel}. This OTP expires in ${expiresMinutes} minutes.
        </p>
        <div style="font-size:28px;font-weight:700;letter-spacing:0.2em;background:#f8fafc;border:1px dashed #e2e8f0;padding:14px 16px;border-radius:12px;text-align:center;">
          ${code}
        </div>
        <p style="margin:16px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
          If you did not request this, you can safely ignore this email. For help, contact
          <a href="mailto:${supportEmail}" style="color:#d62839;text-decoration:none;">${supportEmail}</a>.
        </p>
      </div>
    </div>
    <div style="max-width:560px;margin:14px auto 0;color:#94a3b8;font-size:11px;text-align:center;">
      This is an automated message from ${brandName}. Please do not reply.
    </div>
  </div>
  `;

  return { subject, html, text };
};

module.exports = { buildOtpEmail };
