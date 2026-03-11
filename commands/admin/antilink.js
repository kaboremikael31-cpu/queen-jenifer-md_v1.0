const config = require('../../config');

module.exports = {
    name: 'antilink',
    aliases: ['antilien'],
    admin: true,
    group: true,
    description: 'Activer/désactiver la protection anti-liens',
    
    async execute(sock, m, args, config) {
        const from = m.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `❌ Usage: !antilink [on/off]\n\nStatus actuel: ${config.antilink ? 'Activé ✅' : 'Désactivé ❌'}`
            });
        }
        
        const option = args[0].toLowerCase();
        
        if (option === 'on') {
            config.antilink = true;
            await sock.sendMessage(from, { 
                text: '✅ *Anti-lien activé!*\nTous les liens seront supprimés automatiquement.'
            });
        } else if (option === 'off') {
            config.antilink = false;
            await sock.sendMessage(from, { 
                text: '❌ *Anti-lien désactivé!*'
            });
        }
    }
};

// Anti-lien automatique
async function checkAntilink(sock, m) {
    if (!config.antilink) return;
    
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const message = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    
    // Regex pour détecter les liens
    const linkRegex = /(https?:\/\/[^\s]+)|(chat\.whatsapp\.com\/[^\s]+)|(wa\.me\/[^\s]+)/gi;
    
    if (linkRegex.test(message)) {
        // Vérifier si l'utilisateur est admin
        const isAdmin = await require('../../lib/handler').isAdmin(sock, from, sender);
        
        if (!isAdmin) {
            try {
                await sock.sendMessage(from, { 
                    delete: m.key 
                });
                
                await sock.sendMessage(from, {
                    text: `⚠️ @${sender.split('@')[0]} les liens ne sont pas autorisés dans ce groupe!`,
                    mentions: [sender]
                });
            } catch (e) {}
        }
    }
          }
