const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const generateRTCToken = (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = req.query.channel || 'default_channel';
    const uid = req.query.uid || 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora credentials not configured'
      });
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    res.json({
      token,
      appId
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = {
  generateRTCToken
};