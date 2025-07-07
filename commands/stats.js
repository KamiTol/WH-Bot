const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/users.json');

// Mapeo de ID de rol a nombre de rango
const ROLE_RANKS = {
    '1382568905297494146': '🌑 - Aspirante',
    '1382568905213476894': '🛡️ - Escudero',
    '1382582840255844352': '💢 - Guardian',
    '1382582836388827179': '🔆 - Sacerdote Oscuro',
    '1382579268554588200': '👹 - Guerrero Oscuro',
    '1382579270940884992': '🧝 - Centinela Oscuro',
    '1382579269800038444': '⚔️ - Caballero Oscuro',
    '1382580470335799436': '🐲 - Abyss Soul',
    '1382568903191957585': '🗡️ - Abyss Knight',
    '1382568902105501767': '🔱 - Disciple of the Abyss',
    '1382568903791607859': '🃏 - Jester (Exclusive)',
    '1382568803069591682': '🌌 - Counselor of the Abyss',
    '1347371372698927164': '👑 - Crown of the Abyss',
    '1381773497168040107': '🔰 - Iniciado' // este se ignora
};

// Lista ordenada de rol IDs por jerarquía de menor a mayor (sin el rol "Iniciado")
const RANK_HIERARCHY = [
    '1382568905297494146', // Aspirante
    '1382568905213476894', // Escudero
    '1382582840255844352', // Guardian
    '1382582836388827179', // Sacerdote Oscuro
    '1382579268554588200', // Guerrero Oscuro
    '1382579270940884992', // Centinela Oscuro
    '1382579269800038444', // Caballero Oscuro
    '1382580470335799436', // Abyss Soul
    '1382568903191957585', // Abyss Knight
    '1382568902105501767', // Disciple of the Abyss
    '1382568903791607859', // Jester
    '1382568803069591682', // Counselor
    '1347371372698927164'  // Crown
];

module.exports = {
    data: {
        name: 'stats',
        description: 'Consultar wars, helps y rango de un usuario.',
        options: [
            {
                name: 'usuario',
                type: 6, // USER
                description: 'Usuario a consultar',
                required: false,
            },
        ],
    },
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const userId = user.id;

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const userData = data[userId] || { wars: 0, helps: 0 };

        const member = await interaction.guild.members.fetch(userId);

        // Obtener el rol más alto del usuario que esté en la jerarquía
        const userRoleId = RANK_HIERARCHY.slice().reverse().find(roleId =>
            member.roles.cache.has(roleId)
        );

        const rango = userRoleId ? ROLE_RANKS[userRoleId] : '🔰 - Iniciado';

        return interaction.reply({
            content: `📊 Estadísticas de **${user.username}**\n\n` +
                     `⚔️ Wars: **${userData.wars}**\n` +
                     `💠 Helps: **${userData.helps}**\n` +
                     `🎖️ Rango actual: **${rango}**`,
            ephemeral: false
        });
    },
};
