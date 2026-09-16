require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

if (!user || !pass) {
  console.error('SMTP_NOT_CONFIGURED: check the .env file.');
  process.exit(1);
}

if (!/^[a-zA-Z0-9]{16}$/.test(pass)) {
  console.error('SMTP_INVALID_PASSWORD: the Gmail App Password must contain exactly 16 letters/numbers.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

transporter.verify()
  .then(() => console.log('SMTP authentication verified.'))
  .catch((error) => {
    console.error(`SMTP authentication failed: ${error.code || error.message}`);
    process.exit(1);
  });
