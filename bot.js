// bot.js - Proxy Mastermind Bot
const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const axios = require('axios');
const fs = require('fs');

// ============================================
// ⚙️ CONFIGURATION
// ============================================
const SERVER_IP = "pl.pvpmc.qzz.io";
const SERVER_PORT = 25565;
const BOT_COUNT = 50;  // Start slow, increase gradually
const DELAY_BETWEEN_BOTS = 3000; // 3 seconds between each bot

// ============================================
// 📝 PROXY LIST (Add your proxies here)
// ============================================
// Format: ip:port:username:password (for auth) or ip:port (for no auth)
const PROXY_LIST = [
    // SOCKS5 Proxies - Add your own
    // "185.189.132.214:17103:user:pass",
    // "proxy1.com:1080",
    // "proxy2.com:1080:user:pass",
];

// ============================================
// 🔄 AUTO PROXY FETCHER (Free proxies from GitHub)
// ============================================
async function fetchFreeProxies() {
    console.log("🔄 Fetching free proxies...");
    try {
        // Free proxy lists from GitHub
        const sources = [
            "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
            "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt",
            "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt"
        ];
        
        const allProxies = [];
        for (const url of sources) {
            try {
                const response = await axios.get(url, { timeout: 5000 });
                const proxies = response.data.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => line.trim());
                allProxies.push(...proxies);
                console.log(`✅ Loaded ${proxies.length} proxies from ${url}`);
            } catch (e) {
                console.log(`⚠️ Failed to fetch from ${url}`);
            }
        }
        
        // Remove duplicates
        const uniqueProxies = [...new Set(allProxies)];
        console.log(`📊 Total unique proxies: ${uniqueProxies.length}`);
        return uniqueProxies;
    } catch (e) {
        console.log("❌ Failed to fetch free proxies:", e.message);
        return [];
    }
}

// ============================================
# 🔄 PROXY ROTATION SYSTEM
# ============================================
class ProxyManager {
    constructor() {
        this.proxies = [];
        this.currentIndex = 0;
        this.usedProxies = [];
        this.failedProxies = [];
    }

    async loadProxies() {
        // Try to load from file first
        try {
            if (fs.existsSync('proxies.txt')) {
                const data = fs.readFileSync('proxies.txt', 'utf8');
                const lines = data.split('\n').filter(l => l.trim());
                this.proxies = lines.map(l => {
                    const parts = l.trim().split(':');
                    if (parts.length === 4) {
                        return { ip: parts[0], port: parseInt(parts[1]), username: parts[2], password: parts[3] };
                    } else if (parts.length === 2) {
                        return { ip: parts[0], port: parseInt(parts[1]) };
                    }
                    return null;
                }).filter(p => p !== null);
                console.log(`📂 Loaded ${this.proxies.length} proxies from proxies.txt`);
                return;
            }
        } catch (e) {}

        // If no file, fetch from internet
        const freeProxies = await fetchFreeProxies();
        this.proxies = freeProxies.map(p => {
            const parts = p.split(':');
            if (parts.length >= 2) {
                return { ip: parts[0], port: parseInt(parts[1]) };
            }
            return null;
        }).filter(p => p !== null);
        
        console.log(`📊 Total proxies available: ${this.proxies.length}`);
    }

    getNextProxy() {
        if (this.proxies.length === 0) {
            return null;
        }
        
        // Try to find an unused proxy
        for (let i = 0; i < this.proxies.length; i++) {
            const idx = (this.currentIndex + i) % this.proxies.length;
            const proxy = this.proxies[idx];
            if (!this.usedProxies.includes(idx) && !this.failedProxies.includes(idx)) {
                this.currentIndex = (idx + 1) % this.proxies.length;
                this.usedProxies.push(idx);
                return proxy;
            }
        }
        
        // If all proxies used, reset used list
        this.usedProxies = [];
        if (this.failedProxies.length === this.proxies.length) {
            console.log("⚠️ All proxies failed, resetting...");
            this.failedProxies = [];
        }
        return this.getNextProxy();
    }

    markFailed(index) {
        this.failedProxies.push(index);
    }

    getStats() {
        return {
            total: this.proxies.length,
            used: this.usedProxies.length,
            failed: this.failedProxies.length,
            available: this.proxies.length - this.failedProxies.length
        };
    }
}

// ============================================
# 🤖 PROXY BOT CREATOR
# ============================================
function createBotWithProxy(botId, proxy, serverIp, serverPort) {
    const username = generateName(botId);
    
    console.log(`🔧 Creating bot ${botId}: ${username} with proxy ${proxy.ip}:${proxy.port}`);
    
    const bot = mineflayer.createBot({
        host: serverIp,
        port: serverPort,
        username: username,
        version: '1.20.4',
        auth: 'offline',
        connect: (client) => {
            const proxyConfig = {
                proxy: {
                    ipaddress: proxy.ip,
                    port: proxy.port,
                    type: 5
                },
                command: 'connect',
                destination: {
                    host: client.host || serverIp,
                    port: client.port || serverPort
                }
            };
            
            // Add auth if provided
            if (proxy.username) {
                proxyConfig.proxy.userId = proxy.username;
                proxyConfig.proxy.password = proxy.password;
            }
            
            SocksClient.createConnection(proxyConfig, (err, info) => {
                if (err) {
                    console.log(`❌ ${username} proxy error: ${err.message}`);
                    return;
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    // Event handlers
    bot.on('login', () => {
        console.log(`✅ ${username} joined via proxy ${proxy.ip}:${proxy.port}`);
    });

    bot.on('error', (err) => {
        console.log(`❌ ${username} error: ${err.message}`);
        if (err.message.includes('ECONNRESET') || err.message.includes('timeout')) {
            proxyManager.markFailed(botId % proxyManager.proxies.length);
        }
    });

    bot.on('end', (reason) => {
        console.log(`🚪 ${username} left: ${reason}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`👢 ${username} kicked: ${reason}`);
        // Try to reconnect with new proxy after delay
        setTimeout(() => {
            const newProxy = proxyManager.getNextProxy();
            if (newProxy) {
                console.log(`🔄 Reconnecting ${username} with new proxy...`);
                createBotWithProxy(botId, newProxy, serverIp, serverPort);
            }
        }, 30000);
    });

    bot.on('spawn', () => {
        // Anti-AFK
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

// ============================================
# 📝 NAME GENERATOR
# ============================================
function generateName(botId) {
    const names = ["Diamond", "Creeper", "Steve", "Alex", "Herobrine", "Notch", "Jeb", "Dream", "Techno", "Gamer", "Noob", "Pro", "PvP", "Legend", "Warrior", "Shadow", "Hunter", "Fighter", "Beast", "Titan", "Star", "King", "Queen", "Lord", "Ghost", "Blaze", "Wither", "Dragon", "Phoenix", "Knight", "Sniper", "Sage", "Viper", "Wolf", "Hawk", "Tiger", "Lion", "Eagle", "Falcon", "Strike", "Boss", "Champ", "Hero", "Viking", "Demon", "Angel", "Guardian", "Wizard", "Elite"];
    const suffixes = ["YT", "TV", "MC", "XD", "OP", "Pro", "Noob"];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(Math.random() * 9999);
    return `${name}${suffix}_${botId}`;
}

// ============================================
# 🚀 MASS JOIN FUNCTION
# ============================================
let proxyManager = new ProxyManager();

async function massJoin() {
    console.log("=".repeat(50));
    console.log("🔥 PROXY MASTERMIND BOT");
    console.log("=".repeat(50));
    console.log(`🎯 Target: ${SERVER_IP}:${SERVER_PORT}`);
    console.log(`📊 Bots: ${BOT_COUNT}`);
    console.log(`⏳ Delay: ${DELAY_BETWEEN_BOTS}ms`);
    console.log("=".repeat(50));

    // Load proxies
    await proxyManager.loadProxies();
    
    if (proxyManager.proxies.length === 0) {
        console.log("❌ No proxies available! Please add proxies to proxies.txt");
        console.log("📝 Format: ip:port or ip:port:user:pass");
        return;
    }

    console.log(`📊 Proxy stats: ${proxyManager.getStats().total} total`);
    console.log("=".repeat(50));

    // Create bots with delay
    let created = 0;
    for (let i = 0; i < BOT_COUNT; i++) {
        const proxy = proxyManager.getNextProxy();
        if (!proxy) {
            console.log("⚠️ No more proxies available");
            break;
        }
        
        setTimeout(() => {
            createBotWithProxy(i, proxy, SERVER_IP, SERVER_PORT);
            created++;
            if (created % 10 === 0) {
                console.log(`📊 Progress: ${created}/${BOT_COUNT} bots created`);
                console.log(`📊 Proxy stats:`, proxyManager.getStats());
            }
        }, i * DELAY_BETWEEN_BOTS);
    }

    console.log(`✅ Started creating ${created} bots...`);
    console.log("🔄 Keeping bots alive...");
}

// ============================================
# 🔥 START
# ============================================
massJoin().catch(console.error);
