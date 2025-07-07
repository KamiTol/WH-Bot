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

const builder = new SlashCommandBuilder()
    .setName('asignar-multiple')
    .setDescription('Asignar Wars y Helps a varios usuarios (hasta 5).');

for (let i = 1; i <= 5; i++) {
    builder.addUserOption(option =>
        option.setName(`usuario${i}`)
            .setDescription(`Usuario #${i}`)
            .setRequired(i === 1) // Solo el primero es obligatorio
    );
    builder.addIntegerOption(option =>
        option.setName(`wars${i}`)
            .setDescription(`Wars para usuario #${i}`)
            .setRequired(false)
    );
    builder.addIntegerOption(option =>
        option.setName(`helps${i}`)
            .setDescription(`Helps para usuario #${i}`)
            .setRequired(false)
    );
}

module.exports = {
    data: builder,

    async execute(interaction) {
        const allowedChannelId = process.env.COMMAND_CHANNEL_ID;
        if (interaction.channelId !== allowedChannelId) {
            return interaction.reply({
                content: '❌ Este comando solo puede usarse en el canal autorizado.',
                flags: EPHEMERAL
            });
        }

        const author = interaction.member;
        const allowedRoles = process.env.ROLE_IDS.split(',');
        const hasPermission = allowedRoles.some(roleId => author.roles.cache.has(roleId));

        if (!hasPermission) {
            return interaction.reply({
                content: '❌ No tienes permiso para usar este comando.',
                flags: EPHEMERAL
            });
        }

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const usuariosAsignados = [];
        const errores = [];

        for (let i = 1; i <= 5; i++) {
            const user = interaction.options.getUser(`usuario${i}`);
            if (!user) continue;

            const wars = interaction.options.getInteger(`wars${i}`) || 0;
            const helps = interaction.options.getInteger(`helps${i}`) || 0;
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                errores.push(`❌ No se encontró el usuario <@${user.id}>`);
                continue;
            }

            if (!data[user.id]) data[user.id] = { wars: 0, helps: 0 };

            data[user.id].wars += wars;
            data[user.id].helps += helps;

            const rangoCandidato = obtenerCandidatoARango(data[user.id].wars, data[user.id].helps);
            const yaFelicitado = data[user.id].ultimoRango === rangoCandidato;

            if (rangoCandidato && !yaFelicitado) {
                const candidateRoleId = rankNameToId[rangoCandidato];
                const isSuperior = isHigherOrEqualRank(member, candidateRoleId);

                if (!isSuperior) {
                    const channel = interaction.client.channels.cache.get(process.env.CHANNEL_ID);
                    if (channel) {
                        await channel.send(`🏅 ¡Felicidades <@${user.id}>! Has alcanzado ${data[user.id].wars} wars y ${data[user.id].helps} helps, ¡eres candidato a ser **${rangoCandidato}**!`);
                        data[user.id].ultimoRango = rangoCandidato;
                    }
                }
            }

            usuariosAsignados.push(`<@${user.id}> → ${wars} wars, ${helps} helps`);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        try {
            await updateRankingMessage(interaction.client);
        } catch (err) {
            console.error('Error en updateRankingMessage:', err);
        }

        let respuesta = '';
        if (usuariosAsignados.length) {
            respuesta += `✅ Asignaciones realizadas:\n${usuariosAsignados.join('\n')}\n`;
        }
        if (errores.length) {
            respuesta += `\n⚠️ Errores:\n${errores.join('\n')}`;
        }

        return interaction.reply({
            content: respuesta || 'Nada fue procesado.',
            flags: EPHEMERAL
        });
    }
};
