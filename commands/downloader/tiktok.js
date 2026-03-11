const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tiktokdl'],
    description: 'Télécharger vidéo TikTok sans watermark',
    
    async execute(sock, m, args, config) {
        const from = m.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: '❌ Veuillez fournir un lien TikTok!'
            });
        }
        
        const url = args[0];
        
        try {
            await sock.sendMessage(from, { 
                text: '⏳ *Téléchargement en cours...*' 
            });
            
            // API TikTok download (à remplacer par votre API)
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data.data;
            
            if (data && data.play) {
                const videoUrl = data.play;
                const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                
                await sock.sendMessage(from, {
                    video: Buffer.from(videoBuffer.data),
                    caption: `🎵 *TikTok Downloader*\n\n👤 *Auteur:* ${data.author.nickname}\n📝 *Titre:* ${data.title}\n❤️ *Likes:* ${data.digg_count}\n💬 *Commentaires:* ${data.comment_count}\n🔗 *Lien:* ${url}`,
                    contextInfo: {
                        externalAdReply: {
                            title: config.botName,
                            body: 'TikTok Download',
                            thumbnail: config.media.repo,
                            sourceUrl: url,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });
            } else {
                await sock.sendMessage(from, { 
                    text: '❌ Impossible de télécharger cette vidéo!'
                });
            }
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}`
            });
        }
    }
};
