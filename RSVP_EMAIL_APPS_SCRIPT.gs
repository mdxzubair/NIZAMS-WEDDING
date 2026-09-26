const RSVP_RECIPIENT = 'mohammedzubair12900@gmail.com';
const QUEUE_KEY = 'NIZAM_RSVP_EMAIL_QUEUE_V1';

/** Web app endpoint. Deploy as: Execute as Me, Who has access: Anyone. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const rsvp = sanitize(data);
    if (!rsvp.name || !Number.isInteger(rsvp.guests) || rsvp.guests < 1 || rsvp.guests > 10) {
      return json({ ok: false, error: 'Invalid RSVP data' });
    }

    const remaining = MailApp.getRemainingDailyQuota();
    if (remaining > 0) {
      sendOne(rsvp);
    } else {
      queue(rsvp);
      ensureQueueTrigger();
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Run this once manually after deployment if you want the queue trigger immediately. */
function setupQueueTrigger() {
  ensureQueueTrigger();
}

/** Sends queued notifications when daily quota becomes available. */
function processQueue() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    let q = readQueue();
    let remaining = MailApp.getRemainingDailyQuota();
    while (q.length && remaining > 0) {
      sendOne(q.shift());
      remaining--;
    }
    writeQueue(q);
  } finally {
    lock.releaseLock();
  }
}

function sendOne(r) {
  const subject = `New RSVP received — ${r.name}`;
  const text = [
    'New RSVP received', '',
    `Name: ${r.name}`,
    `Attendance: ${r.status === 'declined' ? 'Not attending' : r.attendance}`,
    `Guests: ${r.guests}`,
    r.message ? `Message: ${r.message}` : ''
  ].filter(Boolean).join('\n');
  MailApp.sendEmail({to: RSVP_RECIPIENT, subject, body: text, name: "Nizam's Wedding RSVP"});
}

function queue(r) {
  const q = readQueue();
  q.push(r);
  writeQueue(q.slice(-500));
}

function readQueue() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty(QUEUE_KEY) || '[]');
}

function writeQueue(q) {
  PropertiesService.getScriptProperties().setProperty(QUEUE_KEY, JSON.stringify(q));
}

function ensureQueueTrigger() {
  const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'processQueue');
  if (!exists) ScriptApp.newTrigger('processQueue').timeBased().everyHours(1).create();
}

function sanitize(data) {
  return {
    name: clean(data.name, 80),
    guests: Number(data.guests),
    status: clean(data.status, 20),
    attendance: clean(data.attendance, 80),
    message: clean(data.message, 300)
  };
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[<>]/g, '').trim().slice(0, max);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
