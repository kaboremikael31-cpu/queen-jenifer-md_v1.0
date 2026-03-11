module.exports = {
    name: 'welcome',
    aliases: ['accueil'],
    admin: true,
    group: true,
    description: 'Configurer le message de bienvenue',
    
    async execute(sock, m, args, config) {
        const from = m.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `❌ Usage: !welcome [on/off/set]\n\nStatus: ${config.welcomeEnabled ? 'Activé ✅' : 'Désactivé ❌'}`
            });
        }
        
        const option = args[0].toLowerCase();
        
        if (option === 'on') {
            config.welcomeEnabled = true;
            await sock.sendMessage(from, { 
                text: '✅ *Messages de bienvenue activés!*'
            });
        } else if (option === 'off') {
            config.welcomeEnabled = false;
            await sock.sendMessage(from, { 
                text: '❌ *Messages de bienvenue désactivés!*'
            });
        } else if (option === 'set') {
            const welcomeMsg = args.slice(1).join(' ');
            if (!welcomeMsg) {
                return sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir le message de bienvenue!'
                });
            }
            config.welcomeMessage = welcomeMsg;
            await sock.sendMessage(from, { 
                text: `✅ *Message de bienvenue mis à jour!*\n\nNouveau message: ${welcomeMsg}`
            });
        }
    }
};

// Gestionnaire de bienvenue
async function handleWelcome(sock, groupId, participants, action) {
    if (!config.welcomeEnabled) return;
    
    if (action === 'add') {
        for (let participant of participants) {
            const welcomeMsg = config.welcomeMessage || 
                `Bienvenue @${participant.split('@')[0]} dans le groupe!\nPrésente-toi stp.`;
            
            await sock.sendMessage(groupId, {
                image: config.media.welcome,
                caption: welcomeMsg,
                mentions: [participant],
                contextInfo: {
                    externalAdReply: {
                        title: config.botName,
                        body: 'Nouveau membre',
                        thumbnail: config.media.repo,
                        sourceUrl: config.supportLink,
                        mediaType: 1
                    }
                }
            });
        }
    } else if (action === 'remove') {
        for (let participant of participants) {
            await sock.sendMessage(groupId, {
                text: `👋 Au revoir @${participant.split('@')[0]}!`,
                mentions: [participant]
            });
        }
    }
          }
