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
const fallbackSessionSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = process.env.SESSION_SECRET || fallbackSessionSecret;
const localSqlitePath = path.join(process.env.VERCEL ? os.tmpdir() : __dirname, 'data.sqlite');
const databaseUrl = process.env.TURSO_DATABASE_URL || `file:${localSqlitePath}`;
const databaseToken = process.env.TURSO_AUTH_TOKEN;
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
const smtpPassFormatValid = /^[a-zA-Z0-9]{16}$/.test(smtpPass || '');
const authNotificationRecipient = (process.env.AUTH_NOTIFICATION_RECIPIENT || process.env.LEAD_RECIPIENT || smtpUser || '').trim();
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
const productionDatabaseMissing = isProduction && !process.env.TURSO_DATABASE_URL;
const OTP_EXPIRATION_SECONDS = 3 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

app.use(express.json({ limit: '10mb' }));
app.use((request, response, next) => {
  const origin = request.headers.origin;
  const allowedOriginPattern = /^(https?:\/\/localhost(?::\d+)?|https?:\/\/127\.0\.0\.1(?::\d+)?|https?:\/\/.*\.vercel\.app)$/i;
  if (origin && allowedOriginPattern.test(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});
if (!process.env.SESSION_SECRET && !isProduction) {
  console.warn('SESSION_SECRET is missing; using a generated local secret for development. Set SESSION_SECRET in .env or Vercel for stable sessions.');
} else if (!process.env.SESSION_SECRET && isProduction) {
  console.warn('SESSION_SECRET is missing in production. Set a stable SESSION_SECRET in Vercel to avoid session resets between deployments and cold starts.');
}

if (productionDatabaseMissing) console.error('TURSO_DATABASE_URL must be configured in production. API requests are disabled until durable storage is configured.');
if (isProduction && (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber)) {
  console.warn('Twilio is not configured. Phone password recovery will remain unavailable until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are set.');
}
const database = createClient({ url: databaseUrl, ...(databaseToken ? { authToken: databaseToken } : {}) });
const databaseReady = database.batch([
  'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, phone TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS password_reset_challenges (id TEXT PRIMARY KEY, user_id INTEGER, identifier_hash TEXT NOT NULL, channel TEXT NOT NULL, destination TEXT NOT NULL, otp_hash TEXT NOT NULL, created_at INTEGER NOT NULL, last_sent_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, resend_count INTEGER NOT NULL DEFAULT 0, used_at INTEGER)',
  'CREATE INDEX IF NOT EXISTS idx_password_reset_identifier ON password_reset_challenges (identifier_hash, created_at)',
  'CREATE TABLE IF NOT EXISTS password_reset_sessions (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER)',
  'CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'requested\', service TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, product_description TEXT NOT NULL, spend TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  'CREATE TABLE IF NOT EXISTS strategy_calls (id INTEGER PRIMARY KEY AUTOINCREMENT, ingredients TEXT NOT NULL, audience TEXT NOT NULL, platforms TEXT NOT NULL, brand_colors TEXT NOT NULL, other_references TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
], 'write');
async function addUserColumn(sql) {
  try {
    await database.execute({ sql, args: [] });
  } catch (error) {
    if (!error.message?.includes('duplicate column name')) throw error;
  }
}
const userMigrationReady = databaseReady.then(() => addUserColumn('ALTER TABLE users ADD COLUMN phone TEXT'));

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
  'googled744b3e4033ba80c.html',
  'sitemap.xml',
  'robots.txt'
];

const organizationStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'INKNOVIO',
  url: 'https://inknovio.com/',
  logo: 'https://inknovio.com/assets/inknovio-logo.png',
  image: 'https://inknovio.com/assets/inknovio-logo.png',
  sameAs: [
    'https://www.linkedin.com/company/inknoviotech/home/'
  ]
});
const seoHead = [
  '<title>AI Creative Production for DTC &amp; E-Commerce | INKNOVIO TECH</title>',
  '<meta name="description" content="INKNOVIO creates high-converting AI UGC ad creatives for DTC and e-commerce brands, including video ads, avatars, scripts, hooks, and creative testing assets.">',
  '<meta name="robots" content="index, follow, max-image-preview:large">',
  '<meta name="theme-color" content="#10131c">',
  '<link rel="icon" href="/assets/inknovio-favicon.svg" type="image/svg+xml">',
  '<link rel="apple-touch-icon" href="/assets/inknovio-favicon.svg">',
  '<link rel="canonical" href="https://inknovio.com/">',
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="INKNOVIO TECH">',
  '<meta property="og:title" content="AI Creative Production for DTC &amp; E-Commerce | INKNOVIO TECH">',
  '<meta property="og:description" content="High-converting AI UGC ad creatives for DTC and e-commerce brands.">',
  '<meta property="og:url" content="https://inknovio.com/">',
  '<meta property="og:image" content="https://inknovio.com/assets/inknovio-logo.png">',
  '<meta property="og:image:alt" content="INKNOVIO TECH AI creative production">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="AI Creative Production for DTC &amp; E-Commerce | INKNOVIO TECH">',
  '<meta name="twitter:description" content="High-converting AI UGC ad creatives for DTC and e-commerce brands.">',
  '<meta name="twitter:image" content="https://inknovio.com/assets/inknovio-logo.png">',
  `<script type="application/ld+json">${organizationStructuredData}</script>`
].join('');

function sendSeoHomepage(request, response, next) {
  fs.readFile(path.join(__dirname, 'code.html'), 'utf8', (error, html) => {
    if (error) return next(error);
    response.type('html').send(html.replace('<head>', `<head>${seoHead}`));
  });
}

rootStaticFiles.forEach((fileName) => {
  app.get(`/${fileName}`, (request, response) => {
    response.sendFile(path.join(__dirname, fileName));
  });
});

app.get('/api/index.js', (request, response, next) => {
  if (request.query.asset === 'app.js') return response.sendFile(path.join(__dirname, 'app.js'));
  if (request.query.asset === 'google-site-verification') return response.sendFile(path.join(__dirname, 'googled744b3e4033ba80c.html'));
  if (request.query.asset === 'sitemap') return response.type('application/xml').sendFile(path.join(__dirname, 'sitemap.xml'));
  if (request.query.asset === 'robots') return response.type('text/plain').sendFile(path.join(__dirname, 'robots.txt'));
  if (request.query.asset === 'homepage') return sendSeoHomepage(request, response, next);
  return next();
});

app.use('/api', (request, response, next) => {
  if (productionDatabaseMissing) return response.status(503).json({ error: 'Authentication backend is not configured for production storage. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel.' });
  next();
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));
app.get('/', sendSeoHomepage);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,72}$/;

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeLeadPayload(payload = {}) {
  const name = normalizeText(payload.name || payload.fullName);
  const email = normalizeText(payload.email || '').toLowerCase();
  const rawSpend = normalizeText(payload.spend || payload.estimatedMonthlyAdSpend || payload.estimatedSpend || payload.budget || '');
  const rawCustomSpend = normalizeText(payload.customSpend || payload.customBudget || payload.customPrice || '');
  const productDescriptionParts = [
    normalizeText(payload.productDescription || payload.leadDescription || payload.productDetails || payload.description || payload.message || payload.projectDescription),
    payload.phone ? `Phone: ${normalizeText(payload.phone)}` : '',
    payload.productUrl ? `Product URL: ${normalizeText(payload.productUrl)}` : '',
    payload.website ? `Website: ${normalizeText(payload.website)}` : '',
    payload.company ? `Company: ${normalizeText(payload.company)}` : ''
  ].filter(Boolean);
  const productDescription = productDescriptionParts.join('\n\n');
  const spend = rawSpend || (rawCustomSpend ? 'Custom Price' : '');
  return { name, email, productDescription, spend, customSpend: rawCustomSpend };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = String(storedHash || '').split(':');
    if (!salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false;
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

function normalizePhone(value) {
  const phone = String(value ?? '').trim().replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : '';
}

function hashResetValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function createOtpHash(otp) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${hashResetValue(`${salt}:${otp}`)}`;
}

function verifyOtpHash(otp, storedHash) {
  const [salt, hash] = String(storedHash || '').split(':');
  if (!salt || !/^[a-f0-9]{64}$/i.test(hash)) return false;
  const candidate = Buffer.from(hashResetValue(`${salt}:${otp}`), 'hex');
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function maskDestination(channel, destination) {
  if (channel === 'email') {
    const [localPart, domain] = destination.split('@');
    return `${localPart.slice(0, 2)}***@${domain}`;
  }
  return `***${destination.slice(-4)}`;
}

async function sendPasswordResetCode(channel, destination, otp) {
  if (channel === 'email') {
    if (!transporter) throw new Error('EMAIL_NOT_CONFIGURED');
    const delivery = await transporter.sendMail({
      from: smtpFrom,
      to: destination,
      subject: 'Your INKNOVIO TECH verification code',
      text: [
        'Your INKNOVIO TECH password reset verification code is:',
        '',
        otp,
        '',
        'This code expires in 3 minutes.',
        'If you did not request a password reset, you can safely ignore this message.'
      ].join('\n')
    });
    if (!delivery.accepted?.length) throw new Error('EMAIL_NOT_ACCEPTED');
    console.log(`Password reset email accepted by SMTP for ${maskDestination(channel, destination)}.`);
    return;
  }
  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber || typeof fetch !== 'function') throw new Error('SMS_NOT_CONFIGURED');
  const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
  const body = new URLSearchParams({
    To: destination,
    From: twilioFromNumber,
    Body: `Your INKNOVIO TECH verification code is ${otp}. It expires in 3 minutes.`
  });
  const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioAccountSid)}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!smsResponse.ok) {
    console.error(`Password reset SMS provider rejected the request with HTTP ${smsResponse.status}.`);
    throw new Error('SMS_DELIVERY_FAILED');
  }
  console.log(`Password reset SMS accepted by the provider for ${maskDestination(channel, destination)}.`);
}

function genericResetResponse(response, challengeId, expiresAt) {
  return response.json({ challengeId, expiresAt: expiresAt * 1000, message: 'If an account matches that information, a verification code has been sent.' });
}

async function sendAuthNotification(event, user) {
  if (!transporter || !authNotificationRecipient) {
    console.warn(`Authentication ${event} notification skipped: SMTP recipient is not configured.`);
    return;
  }
  const timestamp = new Date().toISOString();
  const isSignup = event === 'SIGNUP';
  await transporter.sendMail({
    from: smtpUser,
    to: authNotificationRecipient,
    subject: `[INKNOVIO TECH] ${event} notification`,
    text: [
      `Authentication event: ${event}`,
      '',
      isSignup ? 'A new user registered.' : 'A user logged in.',
      `Name: ${isSignup ? user.name : 'Existing user'}`,
      `Email: ${user.email}`,
      `Date/time (UTC): ${timestamp}`
    ].join('\n')
  });
  console.log(`Authentication ${event} notification sent to the configured admin recipient.`);
}

function requireAuth(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ error: 'Please log in to continue.' });
  next();
}

app.post('/api/auth/password-reset/request', async (request, response) => {
  await userMigrationReady;
  const input = String(request.body?.identifier || '').trim();
  const email = input.toLowerCase();
  const channel = emailPattern.test(email) ? 'email' : '';
  const identifier = email;
  if (!channel) return response.status(400).json({ error: 'Enter a valid email address.' });

  const identifierHash = hashResetValue(`${channel}:${identifier}`);
  const now = Math.floor(Date.now() / 1000);
  const rateLimitWindow = now - 15 * 60;
  const recentResult = await database.execute({
    sql: 'SELECT COUNT(*) AS count FROM password_reset_challenges WHERE identifier_hash = ? AND created_at > ?',
    args: [identifierHash, rateLimitWindow]
  });
  if (Number(recentResult.rows[0]?.count || 0) >= 3) return response.status(429).json({ error: 'Too many requests. Please try again later.' });

  const userResult = await database.execute({
    sql: 'SELECT id, email, phone FROM users WHERE email = ?',
    args: [identifier]
  });
  const user = userResult.rows[0];
  const challengeId = crypto.randomBytes(24).toString('hex');
  const otp = String(crypto.randomInt(100000, 1000000));
  const expiresAt = now + OTP_EXPIRATION_SECONDS;
  await database.batch([
    { sql: 'DELETE FROM password_reset_challenges WHERE used_at IS NOT NULL OR expires_at < ?', args: [now] },
    { sql: 'UPDATE password_reset_challenges SET used_at = ? WHERE identifier_hash = ? AND used_at IS NULL', args: [now, identifierHash] },
    { sql: 'INSERT INTO password_reset_challenges (id, user_id, identifier_hash, channel, destination, otp_hash, created_at, last_sent_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [challengeId, user ? Number(user.id) : null, identifierHash, channel, identifier, createOtpHash(otp), now, now, expiresAt] }
  ], 'write');
  request.session = { ...(request.session || {}), passwordResetChallengeId: challengeId };
  if (!user) return genericResetResponse(response, challengeId, expiresAt);
  try {
    await sendPasswordResetCode(channel, identifier, otp);
  } catch (error) {
    console.error('Password reset delivery failed:', error.message);
    return response.status(503).json({ error: 'Recovery delivery is temporarily unavailable. Please try again later.' });
  }
  return genericResetResponse(response, challengeId, expiresAt);
});

app.post('/api/auth/password-reset/resend', async (request, response) => {
  await userMigrationReady;
  const challengeId = String(request.body?.challengeId || '');
  if (!challengeId || challengeId !== request.session?.passwordResetChallengeId) return response.status(400).json({ error: 'Your recovery session is invalid. Start again.' });
  const challengeResult = await database.execute({ sql: 'SELECT * FROM password_reset_challenges WHERE id = ?', args: [challengeId] });
  const challenge = challengeResult.rows[0];
  if (!challenge || challenge.used_at) return response.status(400).json({ error: 'Your recovery session has expired. Start again.' });
  const now = Math.floor(Date.now() / 1000);
  if (Number(challenge.resend_count) >= 5 || now - Number(challenge.last_sent_at) < OTP_RESEND_COOLDOWN_SECONDS) return response.status(429).json({ error: 'Please wait before requesting another code.' });
  const otp = String(crypto.randomInt(100000, 1000000));
  if (challenge.user_id) {
    try {
      await sendPasswordResetCode(challenge.channel, challenge.destination, otp);
    } catch (error) {
      console.error('Password reset resend failed:', error.message);
      return response.status(503).json({ error: 'Recovery delivery is temporarily unavailable. Please try again later.' });
    }
  }
  const expiresAt = now + OTP_EXPIRATION_SECONDS;
  await database.execute({
    sql: 'UPDATE password_reset_challenges SET otp_hash = ?, last_sent_at = ?, expires_at = ?, attempts = 0, resend_count = resend_count + 1 WHERE id = ?',
    args: [createOtpHash(otp), now, expiresAt, challengeId]
  });
  return response.json({ expiresAt: expiresAt * 1000, message: `A new verification code was sent to ${maskDestination(challenge.channel, challenge.destination)}.` });
});

app.post('/api/auth/password-reset/verify', async (request, response) => {
  await userMigrationReady;
  const challengeId = String(request.body?.challengeId || '');
  const otp = String(request.body?.code || '').trim();
  if (!challengeId || challengeId !== request.session?.passwordResetChallengeId || !/^\d{6}$/.test(otp)) return response.status(400).json({ error: 'Enter the six-digit verification code.' });
  const challengeResult = await database.execute({ sql: 'SELECT * FROM password_reset_challenges WHERE id = ?', args: [challengeId] });
  const challenge = challengeResult.rows[0];
  const now = Math.floor(Date.now() / 1000);
  if (!challenge || !challenge.user_id || challenge.used_at) return response.status(400).json({ error: 'This verification code is no longer valid.' });
  if (now >= Number(challenge.expires_at)) return response.status(410).json({ error: 'This verification code has expired. Request a new code.' });
  if (Number(challenge.attempts) >= 5) return response.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
  if (!verifyOtpHash(otp, challenge.otp_hash)) {
    await database.execute({ sql: 'UPDATE password_reset_challenges SET attempts = attempts + 1 WHERE id = ?', args: [challengeId] });
    return response.status(400).json({ error: 'That verification code is incorrect.' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  await database.batch([
    { sql: 'UPDATE password_reset_challenges SET used_at = ? WHERE id = ?', args: [now, challengeId] },
    { sql: 'INSERT INTO password_reset_sessions (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)', args: [challengeId, hashResetValue(resetToken), Number(challenge.user_id), now + 900] }
  ], 'write');
  request.session = { ...(request.session || {}), passwordResetToken: resetToken };
  return response.json({ ok: true });
});

app.post('/api/auth/password-reset/reset', async (request, response) => {
  await userMigrationReady;
  const resetToken = String(request.session?.passwordResetToken || '');
  const password = String(request.body?.password || '');
  const confirmPassword = String(request.body?.confirmPassword || '');
  if (!resetToken) return response.status(401).json({ error: 'Your password reset session has expired. Start again.' });
  if (!passwordPattern.test(password)) return response.status(400).json({ error: 'Password must be 8-72 characters with uppercase, lowercase, number, and symbol.' });
  if (password !== confirmPassword) return response.status(400).json({ error: 'Passwords do not match.' });
  const now = Math.floor(Date.now() / 1000);
  const sessionResult = await database.execute({ sql: 'SELECT id, user_id FROM password_reset_sessions WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?', args: [hashResetValue(resetToken), now] });
  const resetSession = sessionResult.rows[0];
  if (!resetSession) return response.status(401).json({ error: 'Your password reset session has expired. Start again.' });
  await database.batch([
    { sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [hashPassword(password), Number(resetSession.user_id)] },
    { sql: 'UPDATE password_reset_sessions SET used_at = ? WHERE id = ?', args: [now, resetSession.id] }
  ], 'write');
  request.session = null;
  return response.json({ ok: true, message: 'Password updated successfully.' });
});

app.post('/api/auth/signup', async (request, response) => {
  await databaseReady;
  await userMigrationReady;
  const name = String(request.body?.name || '').trim();
  const email = String(request.body?.email || '').trim().toLowerCase();
  const phone = normalizePhone(request.body?.phone);
  const password = String(request.body?.password || '');

  if (name.length < 2 || name.length > 80) return response.status(400).json({ error: 'Enter your full name.' });
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ error: 'Enter a valid email address.' });
  if (request.body?.phone && !phone) return response.status(400).json({ error: 'Enter a valid phone number in international format, such as +15551234567.' });
  if (!passwordPattern.test(password)) return response.status(400).json({ error: 'Password must be 8-72 characters with uppercase, lowercase, number, and symbol.' });

  let userId;
  try {
    const result = await database.execute({
      sql: 'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      args: [name, email, phone || null, hashPassword(password)]
    });
    userId = Number(result.lastInsertRowid);
    request.session = { userId, user: { id: userId, name, email } };
    try {
      await sendAuthNotification('SIGNUP', { name, email });
    } catch (error) {
      console.error('Signup notification failed:', error.code || error.message);
    }
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
  try {
    await sendAuthNotification('LOGIN', { email: user.email });
  } catch (error) {
    console.error('Login notification failed:', error.code || error.message);
  }
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


const meetingUploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'inknovio-meeting-requests')
  : path.join(__dirname, 'uploads', 'meeting-requests');
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

async function executeFormDatabase(operation, readiness = databaseReady) {
  try {
    return await operation();
  } catch (error) {
    if (!/no such table|no such column|has no column named/i.test(error.message || '')) throw error;
    await readiness;
    return operation();
  }
}

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

const smtpConfigured = smtpUser && smtpPass && (smtpHost || smtpPassFormatValid);
const transporter = smtpConfigured
  ? nodemailer.createTransport(smtpHost
    ? { host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } }
    : { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } })
  : null;

if (!transporter) {
  console.warn(smtpHost ? 'SMTP credentials are incomplete.' : smtpUser && smtpPass ? 'SMTP_PASS must be the 16-character Gmail App Password only.' : 'SMTP is not configured. Create a .env file before using the lead form.');
} else {
  transporter.verify()
    .then(() => console.log('SMTP authentication verified.'))
    .catch((error) => console.error('SMTP authentication failed:', error.code || error.message));
}

function queueNotificationEmail(mailOptions, context) {
  if (!transporter) {
    console.warn(`${context} notification skipped because SMTP is not configured.`);
    return;
  }
  void transporter.sendMail(mailOptions).catch((error) => {
    console.error(`${context} notification email failed after saving:`, error.message);
  });
}

app.post('/api/leads', async (request, response) => {
  const { name, email, productDescription, spend, customSpend } = normalizeLeadPayload(request.body || {});
  const cleanName = name;
  const cleanEmail = email;
  const cleanDescription = productDescription;
  const cleanSpend = String(spend || '').trim();
  const providedCustomSpend = String(customSpend || '').trim();
  const validSpend = ['$1,000', '$5,000', '$10,000', 'Custom Price'].includes(cleanSpend);

  if (cleanName.length < 2 || cleanName.length > 80 || !emailPattern.test(cleanEmail) || cleanEmail.length > 254 || cleanDescription.length < 10 || cleanDescription.length > 4000 || !validSpend || (cleanSpend === 'Custom Price' && (providedCustomSpend.length < 1 || providedCustomSpend.length > 120))) {
    return response.status(400).json({ error: 'Please complete all fields with valid information.' });
  }

  try {
    const storedSpend = cleanSpend === 'Custom Price' ? `Custom Price: ${providedCustomSpend}` : cleanSpend;
    const recentDuplicate = await executeFormDatabase(() => database.execute({
      sql: "SELECT id FROM leads WHERE name = ? AND email = ? AND product_description = ? AND spend = ? AND created_at >= datetime('now', '-10 minutes') LIMIT 1",
      args: [cleanName, cleanEmail, cleanDescription, storedSpend]
    }));
    if (recentDuplicate.rows.length) return response.json({ ok: true, message: 'Your request has already been received.' });
    await executeFormDatabase(() => database.execute({
      sql: 'INSERT INTO leads (name, email, product_description, spend) VALUES (?, ?, ?, ?)',
      args: [cleanName, cleanEmail, cleanDescription, storedSpend]
    }));
    queueNotificationEmail({
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
        `Estimated monthly ad spend: ${cleanSpend === 'Custom Price' ? providedCustomSpend : cleanSpend}`
      ].join('\n')
    }, 'Lead');
    return response.json({ ok: true, message: 'Your request has been received.' });
  } catch (error) {
    console.error('Lead email failed:', error.message);
    if (error.code === 'EAUTH') {
      return response.status(502).json({ error: 'Gmail rejected the SMTP app password. Generate a new Gmail app password and update .env.' });
    }
    return response.status(500).json({ error: 'Unable to send your request right now.' });
  }
});

app.post('/api/contact', async (request, response) => {
  const payload = request.body || {};
  const name = normalizeText(payload.name || payload.fullName);
  const email = normalizeText(payload.email || '').toLowerCase();
  const subject = normalizeText(payload.subject || payload.projectType || 'General inquiry');
  const message = normalizeText(payload.message || payload.details || payload.description || payload.projectDescription);

  if (name.length < 2 || name.length > 80 || !emailPattern.test(email) || email.length > 254 || message.length < 10 || message.length > 4000) {
    return response.status(400).json({ error: 'Please provide a valid name, email, and message.' });
  }

  try {
    const recentDuplicate = await executeFormDatabase(() => database.execute({
      sql: "SELECT id FROM contacts WHERE name = ? AND email = ? AND subject = ? AND message = ? AND created_at >= datetime('now', '-10 minutes') LIMIT 1",
      args: [name, email, subject, message]
    }));
    if (recentDuplicate.rows.length) return response.json({ ok: true, message: 'Your message has already been received.' });
    await executeFormDatabase(() => database.execute({
      sql: 'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      args: [name, email, subject, message]
    }));
    queueNotificationEmail({
      from: smtpUser,
      to: process.env.LEAD_RECIPIENT?.trim() || smtpUser,
      replyTo: email,
      subject: `New INKNOVIO TECH contact inquiry: ${subject}`,
      text: [
        'New contact inquiry',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message
      ].join('\n')
    }, 'Contact');
    return response.json({ ok: true, message: 'Your message was sent successfully.' });
  } catch (error) {
    console.error('Contact request save failed:', error.message);
    return response.status(500).json({ error: 'Unable to save your message right now.' });
  }
});

app.post('/api/strategy-calls', async (request, response) => {
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
    const recentDuplicate = await executeFormDatabase(() => database.execute({
      sql: "SELECT id FROM strategy_calls WHERE name = ? AND email = ? AND niche = ? AND targeted_platforms = ? AND product_details = ? AND created_at >= datetime('now', '-10 minutes') LIMIT 1",
      args: [name, email, niche, targetedPlatforms, productDetails]
    }, strategyCallMigrationReady));
    if (recentDuplicate.rows.length) return response.json({ ok: true, message: 'Your meeting request has already been received.' });

    if (productImageDataUrl) savedImage = validateImageDataUrl(productImageDataUrl, productImageName);
    await executeFormDatabase(() => database.execute({
      sql: 'INSERT INTO strategy_calls (ingredients, audience, platforms, brand_colors, other_references, name, email, niche, targeted_platforms, product_details, requirements, product_image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [productDetails, niche, targetedPlatforms, '', productDetails, name, email, niche, targetedPlatforms, productDetails, requirements, savedImage?.relativePath || null]
    }, strategyCallMigrationReady));
  } catch (error) {
    if (error.message?.startsWith('Please upload') || error.message?.startsWith('Product image')) {
      return response.status(400).json({ error: error.message });
    }
    console.error('Strategy call database save failed:', error.message);
    if (savedImage?.filePath) {
      try { fs.unlinkSync(savedImage.filePath); } catch (unlinkError) { console.error('Failed to remove unsaved meeting image:', unlinkError.message); }
    }
    return response.status(500).json({ error: 'Unable to save your meeting request right now.' });
  }

  const attachments = savedImage ? [{
    filename: savedImage.fileName,
    path: savedImage.filePath,
    contentType: savedImage.mimeType
  }] : [];
  queueNotificationEmail({
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
  }, 'Strategy call');
  return response.json({ ok: true, message: 'Your meeting request has been received.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`INKNOVIO TECH is running at http://localhost:${port}`);
  });
}

module.exports = app;
