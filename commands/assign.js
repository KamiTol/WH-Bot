const { InteractionResponseFlags } = require('discord.js');
const { updateRankingMessage } = require('../utils/rankingManager');
const fs = require('fs');
const path = require('path');
const { roleHierarchy, rankNameToId } = require('../config/ranks');
const filePath = path.join(__dirname, '../data/users.json');
const EPHEMERAL = 1 << 6;

// Verifica si el usuario tiene un rango igual o superior al de candidato
function isHigherOrEqualRank(member, targetRoleId) {
    const targetIndex = roleHierarchy.indexOf(targetRoleId);
    if (targetIndex === -1) return false;

    return member.roles.cache.some(role => {
        const roleIndex = roleHierarchy.indexOf(role.id);
        return roleIndex !== -1 && roleIndex <= targetIndex;
    });
}

// Determina el nombre del rango al que un usuario puede ser candidato
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

module.exports = {
    data: {
        name: 'asignar',
        description: 'Asignar Wars y Helps a un usuario.',
        options: [
            {
                name: 'usuario',
                type: 6,
                description: 'Usuario a asignar',
                required: true,
            },
            {
                name: 'wars',
                type: 4,
                description: 'Cantidad de wars',
                required: false,
            },
            {
                name: 'helps',
                type: 4,
                description: 'Cantidad de helps',
                required: false,
            },
        ],
    },
    
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

        const user = interaction.options.getUser('usuario');
        const member = interaction.guild.members.cache.get(user.id);
        const wars = interaction.options.getInteger('wars') || 0;
        const helps = interaction.options.getInteger('helps') || 0;

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const userId = user.id;
        if (!data[userId]) data[userId] = { wars: 0, helps: 0 };

        data[userId].wars += wars;
        data[userId].helps += helps;

        await interaction.reply({
            content: `✅ Se asignaron ${wars} wars y ${helps} helps a ${user.username}.`,
            flags: EPHEMERAL
        });

        const rangoCandidato = obtenerCandidatoARango(data[userId].wars, data[userId].helps);
        const yaFelicitado = data[userId].ultimoRango === rangoCandidato;

        if (rangoCandidato && !yaFelicitado) {
            const candidateRoleId = rankNameToId[rangoCandidato];
            const isSuperior = isHigherOrEqualRank(member, candidateRoleId);

            if (!isSuperior) {
                const channel = interaction.client.channels.cache.get(process.env.CHANNEL_ID);
                if (channel) {
                    await channel.send(`🏅 ¡Felicidades ${user}! Has alcanzado ${data[userId].wars} wars y ${data[userId].helps} helps, ¡eres candidato a ser **${rangoCandidato}**!`);
                    data[userId].ultimoRango = rangoCandidato;
                }

                await interaction.followUp({
                    content: `🎉 ${user.username} es ahora candidato a **${rangoCandidato}**.`,
                    flags: EPHEMERAL
                });
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        if (typeof updateRankingMessage === 'function') {
            try {
                await updateRankingMessage(interaction.client);
            } catch (err) {
                console.error('❌ Error en updateRankingMessage:', err);
            }
        } else {
            console.warn('⚠️ La función updateRankingMessage no está definida correctamente.');
        }
    },
};

