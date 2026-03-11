const config = require('../config');

const linkPatterns = [
    /chat\.whatsapp\.com\/[^\s]+/gi,
    /wa\.me\/[^\s]+/gi,
    /https?:\/\/[^\s]+/gi,
    /t\.me\/[^\s]+/gi,
    /discord\.gg\/[^\s]+/gi,
    /instagram\.com\/[^\s]+/gi,
    /facebook\.com\/[^\s]+/gi,
    /youtube\.com\/[^\s]+/gi,
    /youtu\.be\/[^\s]+/gi,
    /tiktok\.com\/[^\s]+/gi,
    /twitter\.com\/[^\s]+/gi,
    /x\.com\/[^\s]+/gi
];

async function checkAntilink(sock, m) {
    if (!config.antilink) return false;
    
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const message = m.message?.conversation || 
                    m.message?.extendedTextMessage?.text || 
                    m.message?.imageMessage?.caption || 
                    '';
    
    // Vérifier si l'utilisateur est admin
    const isAdmin = await require('./handler').isAdmin(sock, from, sender);
    if (isAdmin) return false;
    
    for (let pattern of linkPatterns) {
        if (pattern.test(message)) {
            try {
                // Supprimer le message
                await sock.sendMessage(from, { delete: m.key });
                
                // Avertir
                await sock.sendMessage(from, {
                    text: `⚠️ @${sender.split('@')[0]} les liens ne sont pas autorisés dans ce groupe!`,
                    mentions: [sender]
                });
                
                return true;
            } catch (e) {
                console.error('Erreur antilink:', e);
            }
        }
    }
    
    return false;
}

module.exports = { checkAntilink };
