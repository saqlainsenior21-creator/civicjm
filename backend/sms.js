// SMS notifications via Twilio
// If credentials are missing, SMS is silently skipped (no crash)

const SID   = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM  = process.env.TWILIO_PHONE; // e.g. +18765551234

const STATUS_MSG = {
  acknowledged: '✅ Your CivicJM report has been acknowledged by the responsible agency.',
  in_progress:  '🔧 Work has started on your CivicJM report. We are fixing the issue.',
  resolved:     '🎉 Your CivicJM report has been marked RESOLVED. Thank you for reporting!',
  closed:       'ℹ️ Your CivicJM report has been closed. Contact us if the issue persists.',
};

async function sendSMS(to, body) {
  if (!SID || !TOKEN || !FROM) return; // Twilio not configured — skip silently
  if (!to || !to.startsWith('+')) return; // no valid phone
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: FROM, Body: body }).toString(),
    });
    const data = await response.json();
    if (!response.ok) console.error('Twilio SMS error:', data.message);
    else console.log(`SMS sent to ${to} — SID: ${data.sid}`);
  } catch (e) {
    console.error('SMS send failed (non-fatal):', e.message);
  }
}

// Notify citizen when their issue status changes
async function notifyStatusChange(issue, newStatus, note) {
  const msg = STATUS_MSG[newStatus];
  if (!msg) return;
  const lines = [
    `CivicJM: ${issue.title}`,
    `Parish: ${issue.parish}`,
    msg,
    note ? `Note: ${note}` : null,
    `Track: https://civicjm-web-production.up.railway.app/issues/${issue.id}`,
  ].filter(Boolean).join('\n');
  await sendSMS(issue.reporter_phone, lines);
}

// Notify gov users in a parish when a new critical/high issue is submitted
async function notifyGovNewIssue(issue, govPhones) {
  if (!['critical','high'].includes(issue.priority)) return;
  const msg = [
    `🚨 CivicJM NEW ${issue.priority.toUpperCase()} ISSUE`,
    `${issue.title}`,
    `Parish: ${issue.parish}${issue.address ? ' — ' + issue.address : ''}`,
    `Category: ${issue.category.replace('_',' ')}`,
    `View: https://civicjm-web-production.up.railway.app/issues/${issue.id}`,
  ].join('\n');
  for (const phone of govPhones) {
    await sendSMS(phone, msg);
  }
}

module.exports = { sendSMS, notifyStatusChange, notifyGovNewIssue };
