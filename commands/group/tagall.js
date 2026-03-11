module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone'],
    admin: true,
    group: true,
    description: 'Mentionner tous les membres du groupe',
    
    async execute(sock, m, args, config) {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const message = args.join(' ') || '📢 Message du groupe';
        
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            
            let mentions = [];
            let mentionText = `╔══════════════════════╗
║   *@${sender.split('@')[0]}*   ║
╚══════════════════════╝

📢 *Message:* ${message}

👥 *Membres:*\n`;
            
            participants.forEach(p => {
                mentions.push(p.id);
                mentionText += `┣ @${p.id.split('@')[0]}\n`;
            });
            
            mentionText += `┗━━━━━━━━━━━━━━━━━━\n\n> ღᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.botName}ღ`;
            
            await sock.sendMessage(from, {
                image: config.media.userTag,
                caption: mentionText,
                mentions: mentions,
                contextInfo: {
                    externalAdReply: {
                        title: config.botName,
                        body: 'Tag All',
                        thumbnail: config.media.repo,
                        sourceUrl: config.supportLink,
                        mediaType: 1
                    }
                }
            });
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}`
            });
        }
    }
};
