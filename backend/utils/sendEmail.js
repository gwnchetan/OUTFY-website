const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL; // e.g. no-reply@yourdomain.com

const sendOTPEmail = async (email, otp) => {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your verification code',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #111;">Verify your email</h2>
        <p>Use the code below to complete your registration. It expires in <strong>2 minutes.</strong></p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #f97316; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 13px;">If you didn't request this, ignore this email.</p>
      </div>
    `
    });
};

const sendWelcomeEmail = async (email, name) => {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Welcome, ${name}!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #111;">You're in, ${name} </h2>
        <p>Your email has been verified and your account is ready.</p>
        <p style="color: #666; font-size: 13px;">If you didn't create this account, please contact support immediately.</p>
      </div>
    `
    });
};

module.exports = { sendOTPEmail, sendWelcomeEmail };