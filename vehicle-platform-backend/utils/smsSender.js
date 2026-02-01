// utils/smsSender.js
const africastalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

/**
 * Send SMS to a single recipient
 * @param {string} phoneNumber - Recipient's phone number in international format (e.g. +2547XXXXXXX)
 * @param {string} message - Message content
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await sms.send({
      to: [phoneNumber],
      message
    });
    console.log(`✅ SMS sent to ${phoneNumber}:`, response);
  } catch (err) {
    console.error(`❌ SMS failed for ${phoneNumber}:`, err.message);
  }
};

module.exports = { sendSMS };