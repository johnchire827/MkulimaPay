const express = require('express');
const router = express.Router();
const Agora = require('agora-access-token');

router.get('/token', (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = req.query.channel;
    const uid = req.query.uid || 0;
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Calculate token expiration
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token
    const token = Agora.RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      Agora.RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.json({
      token,
      appId,
      channel: channelName,
      uid
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});