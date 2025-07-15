const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { updateRankingMessage } = require('../utils/rankingManager');
const { roleHierarchy, rankNameToId } = require('../config/ranks');

const filePath = path.join(__dirname, '../data/users.json');
const EPHEMERAL = 1 << 6;

function obtenerCandidatoARango(wars, helps) {
    if (wars >= 10 && helps >= 70) return '⚔️ Caballero Oscuro';
    if (wars >= 6 || helps >= 60) return '🧝 Centinela Oscuro';
    if (helps >= 50) return '👹 Guerrero Oscuro';
    if (wars >= 4 || helps >= 40) return '🔆 Sacerdote Oscuro';
    if (wars >= 3 || helps >= 30) return '💢 Guardian';
    if (wars >= 2 || helps >= 20) return '🛡️ Escudero';
    if (wars >= 1 || helps >= 10) return '🌑 Aspirante';
    return null;
}

function isHigherOrEqualRank(member, targetRoleId) {
    const targetIndex = roleHierarchy.indexOf(targetRoleId);
    if (targetIndex === -1) return false;
    return member.roles.cache.some(role => {
        const roleIndex = roleHierarchy.indexOf(role.id);
        return roleIndex !== -1 && roleIndex <= targetIndex;
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asignarhelps')
        .setDescription('Asigna una cantidad de helps a varios usuarios')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de helps a asignar')
                .setRequired(true)
        )
        .addUserOption(opt => opt.setName('usuario1').setDescription('Usuario 1').setRequired(true))
        .addUserOption(opt => opt.setName('usuario2').setDescription('Usuario 2').setRequired(false))
        .addUserOption(opt => opt.setName('usuario3').setDescription('Usuario 3').setRequired(false))
        .addUserOption(opt => opt.setName('usuario4').setDescription('Usuario 4').setRequired(false))
        .addUserOption(opt => opt.setName('usuario5').setDescription('Usuario 5').setRequired(false))
        .addUserOption(opt => opt.setName('usuario6').setDescription('Usuario 6').setRequired(false))
        .addUserOption(opt => opt.setName('usuario7').setDescription('Usuario 7').setRequired(false))
        .addUserOption(opt => opt.setName('usuario8').setDescription('Usuario 8').setRequired(false)),

    async execute(interaction) {
        const allowedChannelId = process.env.COMMAND_CHANNEL_ID;
        if (interaction.channelId !== allowedChannelId) {
            return interaction.reply({ content: '❌ Este comando solo puede usarse en el canal autorizado.', flags: EPHEMERAL });
        }

        const author = interaction.member;
        const allowedRoles = process.env.ROLE_IDS.split(',');
        const hasPermission = allowedRoles.some(roleId => author.roles.cache.has(roleId));
        if (!hasPermission) {
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', flags: EPHEMERAL });
        }

        const cantidad = interaction.options.getInteger('cantidad');
        let data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
        const usuariosAsignados = [];

        for (let i = 1; i <= 8; i++) {
            const user = interaction.options.getUser(`usuario${i}`);
            if (!user) continue;

            const userId = user.id;
            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            if (!data[userId]) data[userId] = { wars: 0, helps: 0 };
            data[userId].helps += cantidad;

            const rangoCandidato = obtenerCandidatoARango(data[userId].wars, data[userId].helps);
            const yaFelicitado = data[userId].ultimoRango === rangoCandidato;

            if (rangoCandidato && !yaFelicitado) {
                const candidateRoleId = rankNameToId[rangoCandidato];
                const isSuperior = isHigherOrEqualRank(member, candidateRoleId);
                if (!isSuperior) {
                    const canal = interaction.client.channels.cache.get(process.env.CHANNEL_ID);
                    if (canal) {
                        await canal.send(`🏅 ¡Felicidades <@${userId}>! Has alcanzado ${data[userId].wars} wars y ${data[userId].helps} helps, ¡eres candidato a **${rangoCandidato}**!`);
                        data[userId].ultimoRango = rangoCandidato;
                    }
                }
            }

            usuariosAsignados.push(`<@${userId}> → +${cantidad} helps`);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        await updateRankingMessage(interaction.client);

        await interaction.reply({
            content: `✅ Helps asignados:\n${usuariosAsignados.join('\n')}`,
            flags: EPHEMERAL
        });
    }
};
