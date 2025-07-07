const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/users.json');
const EPHEMERAL = 1 << 6;

module.exports = {
    data: {
        name: 'syncdb',
        description: 'Registrar automáticamente todos los miembros actuales del servidor en la base de datos.',
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
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
        }

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const members = await interaction.guild.members.fetch();

        members.forEach(member => {
            const userId = member.user.id;
            if (!data[userId]) {
                data[userId] = { wars: 0, helps: 0 };
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return interaction.reply(`✅ Se sincronizaron **${members.size} miembros** con la base de datos.`);
    },
};
