const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const express = require('express');
const cookieSession = require('cookie-session');
const { createClient } = require('@libsql/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT || 3000);
const sessionSecret = process.env.SESSION_SECRET || 'inknovio-session-secret-fallback';
const localSqlitePath = path.join(process.env.VERCEL ? os.tmpdir() : __dirname, 'data.sqlite');
const databaseUrl = process.env.TURSO_DATABASE_URL || `file:${localSqlitePath}`;
const databaseToken = process.env.TURSO_AUTH_TOKEN;
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
const smtpPassFormatValid = /^[a-zA-Z0-9]{16}$/.test(smtpPass || '');

app.use(express.json({ limit: '10mb' }));
if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is missing; using a fallback secret for this deployment. Add a real secret in Vercel or .env for stable sessions.');
}

if (process.env.NODE_ENV === 'production' && !process.env.TURSO_DATABASE_URL) {
  console.warn('TURSO_DATABASE_URL is not configured. The app is using a temporary SQLite fallback in the deployment runtime.');
}
const database = createClient({ url: databaseUrl, ...(databaseToken ? { authToken: databaseToken } : {}) });
const databaseReady = database.batch([
  'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'requested\', service TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, product_description TEXT NOT NULL, spend TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS strategy_calls (id INTEGER PRIMARY KEY AUTOINCREMENT, ingredients TEXT NOT NULL, audience TEXT NOT NULL, platforms TEXT NOT NULL, brand_colors TEXT NOT NULL, other_references TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
], 'write');
async function addUserColumn(sql) {
  try {
    await database.execute({ sql, args: [] });
  } catch (error) {
    if (!error.message?.includes('duplicate column name')) throw error;
  }
}
const userMigrationReady = databaseReady;

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
app.use(cookieSession({
  name: 'session',
  keys: [sessionSecret],
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  maxAge: 1000 * 60 * 60 * 24 * 7
}));

const rootStaticFiles = [
  'app.js',
  'code.html',
  'screen.png',
  'favicon.ico'
];

rootStaticFiles.forEach((fileName) => {
  app.get(`/${fileName}`, (request, response) => {
    response.sendFile(path.join(__dirname, fileName));
  });
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));
app.get('/', (request, response) => response.sendFile(path.join(__dirname, 'code.html')));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,72}$/;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

function requireAuth(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ error: 'Please log in to continue.' });
  next();
}

app.post('/api/auth/signup', async (request, response) => {
  await databaseReady;
  await userMigrationReady;
  const name = String(request.body?.name || '').trim();
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');

  if (name.length < 2 || name.length > 80) return response.status(400).json({ error: 'Enter your full name.' });
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ error: 'Enter a valid email address.' });
  if (!passwordPattern.test(password)) return response.status(400).json({ error: 'Password must be 8-72 characters with uppercase, lowercase, number, and symbol.' });

  let userId;
  try {
    const result = await database.execute({
      sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      args: [name, email, hashPassword(password)]
    });
    userId = Number(result.lastInsertRowid);
    request.session = { userId, user: { id: userId, name, email } };
    return response.status(201).json({ user: request.session.user });
  } catch (error) {
    if (userId) await database.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE')) return response.status(409).json({ error: 'An account with that email already exists.' });
    console.error('Signup failed:', error);
    return response.status(500).json({ error: 'Unable to create your account right now.' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  await databaseReady;
  await userMigrationReady;
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');
  const result = await database.execute({ sql: 'SELECT id, name, email, password_hash FROM users WHERE email = ?', args: [email] });
  const user = result.rows[0];
  if (!user || !password || !verifyPassword(password, user.password_hash)) return response.status(401).json({ error: 'Incorrect email or password.' });
  request.session = { userId: Number(user.id), user: { id: Number(user.id), name: user.name, email: user.email } };
  return response.json({ user: request.session.user });
});

app.get('/api/auth/me', (request, response) => response.json({ user: request.session.user || null }));

app.get('/api/account', requireAuth, async (request, response) => {
  await databaseReady;
  const userResult = await database.execute({ sql: 'SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?', args: [request.session.userId] });
  const user = userResult.rows[0];
  if (!user) return response.status(401).json({ error: 'Your session has expired. Please log in again.' });
  const projectResult = await database.execute({ sql: 'SELECT id, name, status, service, created_at AS createdAt FROM projects WHERE user_id = ? ORDER BY created_at DESC', args: [request.session.userId] });
  const projects = projectResult.rows;
  return response.json({ user, projects });
});

app.post('/api/auth/logout', (request, response) => {
  request.session = null;
  return response.json({ ok: true });
});


const meetingUploadsDir = path.join(__dirname, 'uploads', 'meeting-requests');
fs.mkdirSync(meetingUploadsDir, { recursive: true });

function addStrategyCallColumn(sql) {
  return database.execute({ sql, args: [] }).catch((error) => {
    if (!error.message?.includes('duplicate column name')) throw error;
  });
}

const strategyCallMigrationReady = databaseReady.then(() => Promise.all([
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN name TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN email TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN niche TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN targeted_platforms TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN product_details TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN requirements TEXT'),
  addStrategyCallColumn('ALTER TABLE strategy_calls ADD COLUMN product_image_path TEXT')
]));

function validateImageDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = /^data:(image\/(png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!match) throw new Error('Please upload a valid JPG, JPEG, PNG, or WEBP image.');
  const [, mimeType, , base64Payload] = match;
  const buffer = Buffer.from(base64Payload, 'base64');
  if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
    throw new Error('Product image must be between 1 byte and 10 MB.');
  }
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const filePath = path.join(meetingUploadsDir, safeName);
  fs.writeFileSync(filePath, buffer);
  return { filePath, fileName: safeName, mimeType, relativePath: `/uploads/meeting-requests/${safeName}` };
}

const transporter = smtpUser && smtpPassFormatValid
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  : null;

if (!transporter) {
  console.warn(smtpUser && smtpPass ? 'SMTP_PASS must be the 16-character Gmail App Password only.' : 'SMTP is not configured. Create a .env file before using the lead form.');
} else {
  transporter.verify()
    .then(() => console.log('SMTP authentication verified.'))
    .catch((error) => console.error('SMTP authentication failed:', error.code || error.message));
}

app.post('/api/leads', async (request, response) => {
  await databaseReady;
  const { name, email, productDescription, spend } = request.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanDescription = String(productDescription || '').trim();
  const cleanSpend = String(spend || '').trim();
  const validSpend = ['$1,000', '$5,000', '$10,000', 'Custom Price'].includes(cleanSpend);
  const customSpend = String(request.body?.customSpend || '').trim();

  if (cleanName.length < 2 || cleanName.length > 80 || !emailPattern.test(cleanEmail) || cleanEmail.length > 254 || cleanDescription.length < 10 || cleanDescription.length > 4000 || !validSpend || (cleanSpend === 'Custom Price' && (customSpend.length < 1 || customSpend.length > 120))) {
    return response.status(400).json({ error: 'Please complete all fields with valid information.' });
  }

  try {
    await database.execute({
      sql: 'INSERT INTO leads (name, email, product_description, spend) VALUES (?, ?, ?, ?)',
      args: [cleanName, cleanEmail, cleanDescription, cleanSpend === 'Custom Price' ? `Custom Price: ${customSpend}` : cleanSpend]
    });
    if (!transporter) {
      return response.status(503).json({ error: 'Your request was saved, but email delivery is not configured on the server.' });
    }
    await transporter.sendMail({
      from: smtpUser,
      to: process.env.LEAD_RECIPIENT?.trim() || smtpUser,
      replyTo: cleanEmail,
      subject: 'New INKNOVIO TECH project inquiry',
      text: [
        'New project inquiry',
        '',
        `Name: ${cleanName}`,
        `Work email: ${cleanEmail}`,
        `Product description: ${cleanDescription}`,
        `Estimated monthly ad spend: ${cleanSpend === 'Custom Price' ? customSpend : cleanSpend}`
      ].join('\n')
    });
    return response.json({ ok: true });
  } catch (error) {
    console.error('Lead email failed:', error.message);
    if (error.code === 'EAUTH') {
      return response.status(502).json({ error: 'Gmail rejected the SMTP app password. Generate a new Gmail app password and update .env.' });
    }
    return response.status(500).json({ error: 'Unable to send your request right now.' });
  }
});

app.post('/api/strategy-calls', async (request, response) => {
  await databaseReady;
  await strategyCallMigrationReady;

  const payload = request.body || {};
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const niche = String(payload.niche || '').trim();
  const platforms = Array.isArray(payload.targetedPlatforms)
    ? payload.targetedPlatforms
    : (typeof payload.targetedPlatforms === 'string' ? payload.targetedPlatforms.split(',') : []);
  const targetedPlatforms = platforms.map((item) => String(item).trim()).filter(Boolean).join(', ');
  const productDetails = String(payload.productDetailsRequirements || payload.productDetails || '').trim();
  const requirements = productDetails;
  const productImageDataUrl = String(payload.productImageDataUrl || '').trim();
  const productImageName = String(payload.productImageName || 'product-image').trim() || 'product-image';

  if (!name || name.length < 2 || name.length > 80) return response.status(400).json({ error: 'Please enter your full name.' });
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ error: 'Please enter a valid email address.' });
  if (!niche || niche.length < 2 || niche.length > 200) return response.status(400).json({ error: 'Please enter your niche or business focus.' });
  if (!targetedPlatforms || targetedPlatforms.length < 2) return response.status(400).json({ error: 'Please select at least one target platform.' });
  if (!productImageDataUrl || !/^data:image\/(png|jpe?g|webp);base64,/i.test(productImageDataUrl)) return response.status(400).json({ error: 'Please upload a valid product image.' });
  if (!productDetails || productDetails.length < 10 || productDetails.length > 4000) return response.status(400).json({ error: 'Please add your product details and requirements.' });

  let savedImage = null;
  try {
    if (productImageDataUrl) savedImage = validateImageDataUrl(productImageDataUrl, productImageName);
  } catch (error) {
    return response.status(400).json({ error: error.message || 'The uploaded product image is invalid.' });
  }

  try {
    await database.execute({
      sql: 'INSERT INTO strategy_calls (ingredients, audience, platforms, brand_colors, other_references, name, email, niche, targeted_platforms, product_details, requirements, product_image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [productDetails, niche, targetedPlatforms, '', productDetails, name, email, niche, targetedPlatforms, productDetails, requirements, savedImage?.relativePath || null]
    });

    const attachments = savedImage ? [{
      filename: savedImage.fileName,
      path: savedImage.filePath,
      contentType: savedImage.mimeType
    }] : [];

    if (!transporter) {
      return response.status(503).json({ error: 'Your meeting request was saved, but email delivery is not configured on the server.' });
    }

    await transporter.sendMail({
      from: smtpUser,
      to: process.env.LEAD_RECIPIENT?.trim() || smtpUser,
      replyTo: email,
      subject: 'New INKNOVIO TECH meeting request',
      text: [
        'New Book a Meeting request',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Niche: ${niche}`,
        `Targeted Platforms: ${targetedPlatforms}`,
        `Product Details & Requirements: ${productDetails}`,
        savedImage ? `Product Image: ${savedImage.relativePath}` : 'Product Image: Not provided'
      ].join('\n'),
      attachments
    });

    return response.json({ ok: true, message: 'Your meeting request has been received.' });
  } catch (error) {
    console.error('Strategy call submission failed:', error.message);
    if (savedImage?.filePath) {
      try { fs.unlinkSync(savedImage.filePath); } catch (unlinkError) { console.error('Failed to remove saved meeting image:', unlinkError.message); }
    }
    return response.status(500).json({ error: 'Unable to send your request right now.' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`INKNOVIO TECH is running at http://localhost:${port}`);
  });
}

module.exports = app;
