require('dotenv').config();
const venom = require('venom-bot');
const fs = require('fs');
const { OpenAI } = require('openai'); // use new import style
const os = require('os');
const axios = require('axios');
const express = require('express'); // for dummy web server

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ---------------------
// Persistent variables
// ---------------------
const VAR_FILE = './variables.json';
let variables = {};
if (fs.existsSync(VAR_FILE)) variables = JSON.parse(fs.readFileSync(VAR_FILE));

function saveVars() {
  fs.writeFileSync(VAR_FILE, JSON.stringify(variables, null, 2));
}

// ---------------------
// Bot states
// ---------------------
let afkUsers = {};
let chatbotEnabled = true; // AI chatbot ON by default

// ---------------------
// Start bot
// ---------------------
venom.create({
    session: 'sessions/prick',   // store session in sessions folder
    multidevice: true
})
.then(client => start(client))
.catch(err => console.error(err));

function start(client) {
    client.onMessage(async message => {
        const msg = message.body.trim();
        const from = message.from;

        // ---------------------
        // Chatbot toggle
        // ---------------------
        if (msg === '.chatbot off') {
            chatbotEnabled = false;
            return client.sendText(from, '🤖 Chatbot is now OFF');
        }
        if (msg === '.chatbot on') {
            chatbotEnabled = true;
            return client.sendText(from, '🤖 Chatbot is now ON');
        }

        // ---------------------
        // AI Chatbot
        // ---------------------
        if (msg.startsWith('.chatbot')) {
            if (!chatbotEnabled) return client.sendText(from, '❌ Chatbot is OFF');
            const prompt = msg.slice(9).trim();
            if (!prompt) return client.sendText(from, 'Send a message after .chatbot');
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 500
                });
                await client.sendText(from, response.choices[0].message.content);
            } catch {
                await client.sendText(from, '❌ Error contacting AI');
            }
        }

        // ---------------------
        // AFK
        // ---------------------
        if (msg.startsWith('.afk')) {
            afkUsers[from] = true;
            return client.sendText(from, '🌙 You are now AFK');
        }
        if (msg.startsWith('.afkadmin')) {
            afkUsers[from] = false;
            return client.sendText(from, '✅ AFK disabled');
        }
        if (afkUsers[from]) {
            await client.sendText(from, '🌙 You are currently AFK');
        }

        // ---------------------
        // Variable commands
        // ---------------------
        if (msg.startsWith('.setvar')) {
            const [_, key, ...val] = msg.split(' ');
            if (!key || val.length === 0) return client.sendText(from, 'Usage: .setvar key value');
            variables[key] = val.join(' ');
            saveVars();
            return client.sendText(from, `✅ Variable ${key} set to "${val.join(' ')}"`);
        }
        if (msg.startsWith('.getvar')) {
            const [_, key] = msg.split(' ');
            if (!key) return client.sendText(from, 'Usage: .getvar key');
            return client.sendText(from, variables[key] || `❌ Variable ${key} not found`);
        }
        if (msg.startsWith('.delvar')) {
            const [_, key] = msg.split(' ');
            if (!key) return client.sendText(from, 'Usage: .delvar key');
            delete variables[key];
            saveVars();
            return client.sendText(from, `✅ Variable ${key} deleted`);
        }

        // ---------------------
        // Alive & Info
        // ---------------------
        if (msg === '.alive') {
            await client.sendText(from, getSystemInfo());
            await client.sendText(from, getGeneralMenu());
        }
        if (msg === '.info') {
            return client.sendText(from, `🤖 Prick bot with AI\nOwner: Iyii\nVersion: 6.2.4`);
        }

        // ---------------------
        // Placeholder commands
        // ---------------------
        if (['.ytv','.yta','.play','.song','.video'].includes(msg.split(' ')[0])) {
            return client.sendText(from, '🔧 Media commands coming soon!');
        }
        if (['.gif','.rotate','.flip'].includes(msg.split(' ')[0])) {
            return client.sendText(from, '🔧 Media effects coming soon!');
        }
        if (msg === '.reboot' || msg === '.reload') return client.sendText(from, '⚡ Bot rebooted (simulated)');
        if (msg === '.mention') return client.sendText(from, '⚡ Mention command placeholder');
        if (msg === '.list') return client.sendText(from, '⚡ List command placeholder');
        if (msg === '.del') return client.sendText(from, '⚡ Delete command placeholder');
    });

    console.log('🤖 Prick bot with 35 commands online!');
}

// ---------------------
// System Info & Menu
// ---------------------
function getSystemInfo() {
    return `
╭═══〘 Prick 〙═══⊷❍
┃✦╭──────────────
┃✦│ Owner : Iyii
┃✦│ User : iyii
┃✦│ Mode : private
┃✦│ Server : ${os.type()}
┃✦│ Available RAM : ${Math.floor(os.freemem()/1024/1024)} MB of ${Math.floor(os.totalmem()/1024/1024)} MB
┃✦│ Total Users : 3
┃✦│ Version : 6.2.4
┃✦╰───────────────
╰═════════════════⊷`;
}

function getGeneralMenu() {
    return `
╭════〘 General 〙════⊷❍
┃✦│ 1. .setvar
┃✦│ 2. .getvar
┃✦│ 3. .delvar
┃✦│ 4. .setenv
┃✦│ 5. .delsudo
┃✦│ 6. .afk
┃✦│ 7. .afkadmin
┃✦│ 8. .chatbot
┃✦│ 9. .chatbot on/off
┃✦│ 10. .info
┃✦│ 11. .list
┃✦│ 12. .alive
┃✦│ 13. .setalive
┃✦│ 14. .games
┃✦│ 15. .mention
┃✦│ 16. .reload
┃✦│ 17. .reboot
┃✦│ 18. .gif
┃✦│ 19. .rotate
┃✦│ 20. .flip
┃✦│ 21. .del
┃✦│ 22. .ytv
┃✦│ 23. .yta
┃✦│ 24. .song
┃✦│ 25. .play
┃✦│ 26. .video
┃✦│ 27-35 → placeholders
┃✦╰─────────────────❍
╰══════════════════⊷❍`;
}

// ---------------------
// Dummy web server so Render detects a port
// ---------------------
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Prick bot is running!'));
app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));
