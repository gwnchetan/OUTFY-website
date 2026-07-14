const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL; // e.g. no-reply@yourdomain.com

const sendWelcomeEmail = async (email, name) => {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Welcome, ${name}!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #111;">You're in, ${name} </h2>
        <p>Your account has been created and is ready to use.</p>
        <p style="color: #666; font-size: 13px;">If you didn't create this account, please contact support immediately.</p>
      </div>
    `
    });
};

module.exports = { sendWelcomeEmail };