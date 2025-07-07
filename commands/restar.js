const fs = require('fs');
const path = require('path');
const { roleHierarchy, rankNameToId } = require('../config/ranks');
const { updateRankingMessage } = require('../utils/rankingManager');

const filePath = path.join(__dirname, '../data/users.json');
const EPHEMERAL = 1 << 6;

module.exports = {
    data: {
        name: 'restar',
        description: 'Restar Wars y Helps a un usuario.',
        options: [
            {
                name: 'usuario',
                type: 6,
                description: 'Usuario al que restar',
                required: true,
            },
            {
                name: 'wars',
                type: 4,
                description: 'Cantidad de wars a restar',
                required: false,
            },
            {
                name: 'helps',
                type: 4,
                description: 'Cantidad de helps a restar',
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
        const warsToSubtract = interaction.options.getInteger('wars') || 0;
        const helpsToSubtract = interaction.options.getInteger('helps') || 0;

        if (warsToSubtract <= 0 && helpsToSubtract <= 0) {
            return interaction.reply({
                content: '⚠️ Debes restar al menos 1 war o 1 help.',
                flags: EPHEMERAL
            });
        }

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const userId = user.id;
        if (!data[userId]) {
            return interaction.reply({
                content: `⚠️ ${user.username} no está registrado aún.`,
                flags: EPHEMERAL
            });
        }

        // Aplica la resta sin dejar valores negativos
        data[userId].wars = Math.max(0, data[userId].wars - warsToSubtract);
        data[userId].helps = Math.max(0, data[userId].helps - helpsToSubtract);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        await interaction.reply({
            content: `🔻 Se restaron ${warsToSubtract} wars y ${helpsToSubtract} helps a ${user.username}.`,
            flags: EPHEMERAL
        });

        // Actualiza el ranking si es necesario
        if (typeof updateRankingMessage === 'function') {
            try {
                await updateRankingMessage(interaction.client);
            } catch (err) {
                console.error('❌ Error en updateRankingMessage:', err);
            }
        }
    },
};
