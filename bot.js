// bot.js - Complete Slow Join Bot
const mineflayer = require('mineflayer');

// ============================================
// ⚙️ CONFIGURATION
// ============================================
const SERVER_IP = "pl.pvpmc.qzz.io";
const SERVER_PORT = 25565;
const BOT_COUNT = 20;  // Start slow
const MIN_DELAY = 5000;  // Minimum 5 seconds
const MAX_DELAY = 10000; // Maximum 10 seconds

// ============================================
// 📝 NAME GENERATOR
// ============================================
const NAMES = [
    "Diamond", "Creeper", "Steve", "Alex", "Herobrine",
    "Notch", "Jeb", "Dream", "Techno", "Gamer",
    "Noob", "Pro", "PvP", "Legend", "Warrior",
    "Shadow", "Hunter", "Fighter", "Beast", "Titan",
    "Star", "King", "Queen", "Lord", "Ghost",
    "Blaze", "Wither", "Dragon", "Phoenix", "Knight",
    "Sniper", "Sage", "Viper", "Wolf", "Hawk",
    "Tiger", "Lion", "Eagle", "Falcon", "Strike",
    "Boss", "Champ", "Hero", "Viking", "Demon",
    "Angel", "Guardian", "Wizard", "Elite"
];

const SUFFIXES = ["YT", "TV", "MC", "XD", "OP", "Pro", "Noob"];

function generateName(botId) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const num = Math.floor(Math.random() * 9999);
    return `${name}${suffix}_${botId}`;
}

// ============================================
// 🤖 BOT CREATOR
// ============================================
function createBot(botId) {
    const username = generateName(botId);
    
    console.log(`⏳ [${new Date().toLocaleTimeString()}] Creating bot ${botId}: ${username}`);

    const bot = mineflayer.createBot({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: username,
        version: '1.20.4',
        auth: 'offline'
    });

    // ============================================
    // 🎯 BOT EVENTS
    // ============================================

    bot.on('login', () => {
        console.log(`✅ [${new Date().toLocaleTimeString()}] ${username} joined!`);
    });

    bot.on('error', (err) => {
        console.log(`❌ [${new Date().toLocaleTimeString()}] ${username} error: ${err.message}`);
    });

    bot.on('end', (reason) => {
        console.log(`🚪 [${new Date().toLocaleTimeString()}] ${username} left: ${reason}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`👢 [${new Date().toLocaleTimeString()}] ${username} kicked: ${reason}`);
        // Reconnect after 60 seconds with new name
        setTimeout(() => {
            console.log(`🔄 [${new Date().toLocaleTimeString()}] ${username} reconnecting...`);
            createBot(botId);
        }, 60000);
    });

    // ============================================
    // 🛡️ ANTI-AFK SYSTEM
    // ============================================
    bot.on('spawn', () => {
        console.log(`💤 [${new Date().toLocaleTimeString()}] ${username} spawned!`);
        
        setInterval(() => {
            try {
                const actions = ['jump', 'sneak', 'swing', 'look'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                
                if (action === 'jump') {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 200);
                } else if (action === 'sneak') {
                    bot.setControlState('sneak', true);
                    setTimeout(() => bot.setControlState('sneak', false), 1000);
                } else if (action === 'swing') {
                    bot.swingArm('main');
                } else if (action === 'look') {
                    bot.look(
                        Math.random() * 2 * Math.PI,
                        Math.random() * Math.PI - Math.PI / 2
                    );
                }
            } catch(e) {
                // Ignore errors
            }
        }, 30000); // Every 30 seconds
    });

    // ============================================
    // 💬 AUTO CHAT (Optional)
    // ============================================
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        
        // Random responses
        const responses = [
            "Hello!",
            "Hi there!",
            "How are you?",
            "Nice to meet you!"
        ];
        
        if (Math.random() < 0.1) { // 10% chance to respond
            const response = responses[Math.floor(Math.random() * responses.length)];
            bot.chat(response);
        }
    });

    return bot;
}

// ============================================
// 🚀 MASS JOIN FUNCTION
// ============================================
function massJoin() {
    console.log("=".repeat(60));
    console.log("🔥 MASS BOT JOINER");
    console.log("=".repeat(60));
    console.log(`🎯 Target: ${SERVER_IP}:${SERVER_PORT}`);
    console.log(`📊 Bots: ${BOT_COUNT}`);
    console.log(`⏳ Delay: ${MIN_DELAY}-${MAX_DELAY}ms random delay between bots`);
    console.log("=".repeat(60));

    let created = 0;
    let activeBots = 0;

    for (let i = 0; i < BOT_COUNT; i++) {
        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
        
        setTimeout(() => {
            const bot = createBot(i);
            created++;
            activeBots++;
            
            // Track bot disconnect
            bot.on('end', () => {
                activeBots--;
            });
            
            if ((i + 1) % 5 === 0) {
                console.log(`📊 Progress: ${i+1}/${BOT_COUNT} bots created`);
                console.log(`📊 Active bots: ${activeBots}`);
            }
        }, i * delay);
    }

    // ============================================
    // 📊 STATUS MONITOR
    // ============================================
    setInterval(() => {
        console.log(`📊 [${new Date().toLocaleTimeString()}] Status: ${created}/${BOT_COUNT} created, ${activeBots} active`);
    }, 30000); // Every 30 seconds

    console.log(`✅ Started creating ${BOT_COUNT} bots...`);
    console.log("🔄 Keeping bots alive...");
}

// ============================================
// 🔥 START
// ============================================
massJoin();

// ============================================
// 🛑 GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down...");
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("\n🛑 Shutting down...");
    process.exit(0);
});
