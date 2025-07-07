const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateRankingMessage } = require('../utils/rankingManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inicializartop')
        .setDescription('Inicializa el mensaje de ranking por primera vez.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            await updateRankingMessage(interaction.client);
            await interaction.editReply('✅ Mensaje de ranking creado o actualizado.');
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Hubo un error al crear el mensaje de ranking.');
        }
    },
};
