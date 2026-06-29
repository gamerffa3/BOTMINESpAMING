// bot.js - Multi-Runner Version
const mineflayer = require('mineflayer');

// ============================================
// ⚙️ CONFIGURATION
// ============================================
const SERVER_IP = "pl.pvpmc.qzz.io";
const SERVER_PORT = 25565;

const BOT_COUNT = process.env.BOT_COUNT || 5;
const RUNNER_ID = process.env.BOT_ID || 1;

const MIN_DELAY = 8000;
const MAX_DELAY = 15000;

// ============================================
// 📝 NAME GENERATOR
// ============================================
const NAMES = ["Diamond", "Creeper", "Steve", "Alex", "Herobrine", "Notch", "Jeb", "Dream", "Techno", "Gamer", "Noob", "Pro", "PvP", "Legend", "Warrior", "Shadow", "Hunter", "Fighter", "Beast", "Titan", "Star", "King", "Queen", "Lord", "Ghost", "Blaze", "Wither", "Dragon", "Phoenix", "Knight", "Sniper", "Sage", "Viper", "Wolf", "Hawk", "Tiger", "Lion", "Eagle", "Falcon", "Strike", "Boss", "Champ", "Hero", "Viking", "Demon", "Angel", "Guardian", "Wizard", "Elite"];

const SUFFIXES = ["YT", "TV", "MC", "XD", "OP", "Pro", "Noob"];

function generateName(botId, runnerId) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const num = Math.floor(Math.random() * 9999);
    return `${name}${suffix}_R${runnerId}_${botId}`;
}

// ============================================
// 🤖 BOT CREATOR
// ============================================
function createBot(botId) {
    const username = generateName(botId, RUNNER_ID);
    
    console.log(`⏳ [R${RUNNER_ID}] Creating bot ${botId}: ${username}`);

    const bot = mineflayer.createBot({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: username,
        version: '1.20.4',
        auth: 'offline'
    });

    bot.on('login', () => {
        console.log(`✅ [R${RUNNER_ID}] ${username} joined!`);
    });

    bot.on('error', (err) => {
        console.log(`❌ [R${RUNNER_ID}] ${username} error: ${err.message}`);
    });

    bot.on('end', (reason) => {
        console.log(`🚪 [R${RUNNER_ID}] ${username} left: ${reason}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`👢 [R${RUNNER_ID}] ${username} kicked: ${reason}`);
        setTimeout(() => {
            console.log(`🔄 [R${RUNNER_ID}] ${username} reconnecting...`);
            createBot(botId);
        }, 60000);
    });

    bot.on('spawn', () => {
        console.log(`💤 [R${RUNNER_ID}] ${username} spawned!`);
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
                    bot.look(Math.random() * 2 * Math.PI, Math.random() * Math.PI - Math.PI / 2);
                }
            } catch(e) {}
        }, 30000);
    });

    return bot;
}

// ============================================
// 🚀 MASS JOIN
// ============================================
function massJoin() {
    console.log("=".repeat(60));
    console.log(`🔥 RUNNER ${RUNNER_ID} - MASS BOT JOINER`);
    console.log("=".repeat(60));
    console.log(`🎯 Target: ${SERVER_IP}:${SERVER_PORT}`);
    console.log(`📊 Bots: ${BOT_COUNT}`);
    console.log(`⏳ Delay: ${MIN_DELAY}-${MAX_DELAY}ms`);
    console.log("=".repeat(60));

    for (let i = 0; i < BOT_COUNT; i++) {
        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
        setTimeout(() => {
            createBot(i);
            if ((i + 1) % 5 === 0) {
                console.log(`📊 [R${RUNNER_ID}] Progress: ${i+1}/${BOT_COUNT}`);
            }
        }, i * delay);
    }

    console.log(`✅ [R${RUNNER_ID}] Started ${BOT_COUNT} bots...`);
}

massJoin();

process.on('SIGINT', () => { console.log("\n🛑 Shutting down..."); process.exit(0); });
process.on('SIGTERM', () => { console.log("\n🛑 Shutting down..."); process.exit(0); });
