module.exports = {
    name: 'groupinfo',
    aliases: ['infogroupe', 'gc', 'group'],
    group: true,
    description: 'Afficher les informations du groupe',
    
    async execute(sock, m, args, config) {
        const from = m.key.remoteJid;
        
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin);
            
            const info = `╔══════════════════════╗
║   *INFORMATIONS GROUPE*   ║
╚══════════════════════╝

📌 *Nom:* ${groupMetadata.subject}
🆔 *ID:* ${from.split('@')[0]}
📅 *Créé:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}
👥 *Membres:* ${participants.length}
👑 *Admins:* ${admins.length}
📝 *Description:* ${groupMetadata.desc || 'Aucune description'}

> ღᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.botName}ღ`;

            await sock.sendMessage(from, {
                image: config.media.allothers,
                caption: info,
                contextInfo: {
                    externalAdReply: {
                        title: config.botName,
                        body: 'Info Groupe',
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
