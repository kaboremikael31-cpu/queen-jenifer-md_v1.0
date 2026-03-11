const config = require('../config');
const commands = new Map();

// Charger toutes les commandes
function loadCommands() {
    const categories = ['admin', 'group', 'downloader', 'economy', 'owner'];
    
    categories.forEach(category => {
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${category}/${file}`);
            commands.set(command.name, command);
        }
    });
    
    console.log(`📚 ${commands.size} commandes chargées`);
}

async function handleCommands(sock, m) {
    const sender = m.key.remoteJid;
    const from = m.key.remoteJid;
    const type = m.message?.conversation || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
    const body = type ? type : '';
    const prefix = body.startsWith('!') ? '!' : body.startsWith('.') ? '.' : body.startsWith('/') ? '/' : '!';
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!body.startsWith(prefix)) return;
    
    // Autoread
    if (config.autoread) {
        await sock.readMessages([m.key]);
    }
    
    // Anti-bot
    if (config.antibot && !config.ownerNumber.includes(sender.split('@')[0])) {
        if (m.message?.extendedTextMessage?.text?.includes('bot')) {
            await sock.sendMessage(sender, { text: '🚫 Anti-bot activé!' });
        }
    }
    
    const command = commands.get(commandName) || 
                    Array.from(commands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;
    
    // Vérifier permissions
    if (command.admin && !await isAdmin(sock, from, sender)) {
        return sock.sendMessage(from, { 
            text: '❌ Cette commande est réservée aux administrateurs du groupe!',
            mentions: [sender]
        });
    }
    
    if (command.owner && !config.ownerNumber.includes(sender.split('@')[0])) {
        return sock.sendMessage(from, { 
            text: '❌ Cette commande est réservée au propriétaire du bot!'
        });
    }
    
    if (command.group && !from.endsWith('@g.us')) {
        return sock.sendMessage(from, { 
            text: '❌ Cette commande ne peut être utilisée que dans les groupes!'
        });
    }
    
    try {
        await command.execute(sock, m, args, config);
    } catch (error) {
        console.error(`Erreur commande ${commandName}:`, error);
        await sock.sendMessage(from, { 
            text: `❌ Erreur lors de l'exécution de la commande ${commandName}\n${error.message}`
        });
    }
}

async function isAdmin(sock, groupId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin' || config.ownerNumber.includes(userId.split('@')[0]);
    } catch {
        return false;
    }
}

module.exports = { handleCommands, loadCommands, isAdmin };
