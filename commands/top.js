const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const filePath = path.join(__dirname, '../data/users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Muestra el top 5 de usuarios por wars y helps.'),

    async execute(interaction) {
        
        const allowedRoles = process.env.TOP_ALLOWED_ROLES.split(',');
        const userHasAccess = allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId));

        if (!userHasAccess) {
        return interaction.reply({
            content: '❌ No tienes permiso para usar este comando.',
            flags: EPHEMERAL
        });
        }
        
        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: '❌ No hay datos aún.', ephemeral: true });
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        const usersArray = Object.entries(data).map(([id, stats]) => ({
            id,
            wars: stats.wars || 0,
            helps: stats.helps || 0
        }));

        const topWars = usersArray.sort((a, b) => b.wars - a.wars).slice(0, 10);
        const topHelps = usersArray.sort((a, b) => b.helps - a.helps).slice(0, 10);

        const formatList = (list, type) => list.map((u, i) => {
            const userTag = `<@${u.id}>`;
            return `**${i + 1}.** ${userTag} — ${u[type]} ${type}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🏆 Ranking de Progreso')
            .setColor(0x9b59b6)
            .addFields(
                { name: '⚔️ Top 10 Wars', value: topWars.length ? formatList(topWars, 'wars') : 'Sin datos aún.' },
                { name: '🛡️ Top 10 Helps', value: topHelps.length ? formatList(topHelps, 'helps') : 'Sin datos aún.' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
