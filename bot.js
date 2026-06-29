// bot.js - Complete Mass Bot Join Script
const mineflayer = require('mineflayer');

const SERVER_IP = "pl.pvpmc.qzz.io";
const SERVER_PORT = 25565;
const BOT_COUNT = 100;

const NAMES = ["Diamond", "Creeper", "Steve", "Alex", "Herobrine", "Notch", "Jeb", "Dream", "Techno", "Gamer", "Noob", "Pro", "PvP", "Legend", "Warrior", "Shadow", "Hunter", "Fighter", "Beast", "Titan", "Star", "King", "Queen", "Lord", "Ghost", "Blaze", "Wither", "Dragon", "Phoenix", "Knight", "Sniper", "Sage", "Viper", "Wolf", "Hawk", "Tiger", "Lion", "Eagle", "Falcon", "Strike", "Beast", "Boss", "Champ", "Hero", "Viking", "Demon", "Angel", "Guardian", "Wizard", "Elite"];

const SUFFIXES = ["YT", "TV", "MC", "XD", "OP", "Pro", "Noob"];

function generateName(botId) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const num = Math.floor(Math.random() * 9999);
    return `${name}${suffix}_${botId}`;
}

function createBot(botId) {
    const username = generateName(botId);
    const bot = mineflayer.createBot({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: username,
        version: '1.20.4',
        auth: 'offline'
    });

    bot.on('login', () => console.log(`✅ ${username} joined!`));
    bot.on('error', (err) => console.log(`❌ ${username} error: ${err.message}`));
    bot.on('end', (reason) => console.log(`🚪 ${username} left: ${reason}`));
    bot.on('kicked', (reason) => console.log(`👢 ${username} kicked: ${reason}`));

    bot.on('spawn', () => {
        setInterval(() => {
            try {
                const actions = ['jump', 'sneak', 'swing'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                if (action === 'jump') {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 200);
                } else if (action === 'sneak') {
                    bot.setControlState('sneak', true);
                    setTimeout(() => bot.setControlState('sneak', false), 1000);
                } else if (action === 'swing') {
                    bot.swingArm('main');
                }
            } catch(e) {}
        }, 30000);
    });
}

function massJoin() {
    console.log(`🚀 Starting mass join: ${BOT_COUNT} bots to ${SERVER_IP}`);
    for (let i = 0; i < BOT_COUNT; i++) {
        setTimeout(() => {
            createBot(i);
            if ((i + 1) % 10 === 0) console.log(`📊 Progress: ${i+1}/${BOT_COUNT}`);
        }, i * 500);
    }
}

massJoin();
