const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const filePath = path.join(__dirname, '../data/users.json');
const rankingMessagePath = path.join(__dirname, '../data/rankingMessage.json');

function getTopData() {
    if (!fs.existsSync(filePath)) return { topWars: [], topHelps: [] };

    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const usersArray = Object.entries(data).map(([id, stats]) => ({
        id,
        wars: stats.wars || 0,
        helps: stats.helps || 0
    }));

    const topWars = usersArray.filter(u => u.wars > 0).sort((a, b) => b.wars - a.wars).slice(0, 10);
    const topHelps = usersArray.filter(u => u.helps > 0).sort((a, b) => b.helps - a.helps).slice(0, 10);


    return { topWars, topHelps };
}

function buildEmbed(topWars, topHelps) {
    const formatList = (list, type) =>
        list.map((u, i) => `**${i + 1}.** <@${u.id}> — ${u[type]} ${type}`).join('\n') || 'Sin datos aún.';

    return new EmbedBuilder()
        .setTitle('🏆 Ranking del Clan')
        .setColor(0x8e44ad)
        .addFields(
            { name: '⚔️ Top 10 Wars', value: formatList(topWars, 'wars') },
            { name: '🛡️ Top 10 Helps', value: formatList(topHelps, 'helps') }
        )
        .setTimestamp();
}

async function updateRankingMessage(client) {
    const { topWars, topHelps } = getTopData();
    const embed = buildEmbed(topWars, topHelps);

    const rankingChannel = client.channels.cache.get(process.env.RANKING_CHANNEL_ID);
    if (!rankingChannel) return console.warn('⚠️ Canal de ranking no encontrado.');

    let messageId;
    if (fs.existsSync(rankingMessagePath)) {
        messageId = JSON.parse(fs.readFileSync(rankingMessagePath, 'utf8')).messageId;
    }

    try {
        if (messageId) {
            const message = await rankingChannel.messages.fetch(messageId);
            await message.edit({ embeds: [embed] });
        } else {
            throw new Error('No message ID found.');
        }
    } catch (err) {
        console.warn('⚠️ Mensaje anterior no encontrado o inválido. Creando uno nuevo...');
        try {
            const newMessage = await rankingChannel.send({ embeds: [embed] });
            fs.writeFileSync(rankingMessagePath, JSON.stringify({ messageId: newMessage.id }, null, 2));
            console.log('✅ Mensaje de ranking creado y guardado correctamente.');
        } catch (sendError) {
            console.error('❌ Error al enviar nuevo mensaje de ranking:', sendError);
        }
    }
}

module.exports = { updateRankingMessage };
