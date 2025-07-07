const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/users.json');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const userId = member.user.id;

        let data = {};
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        if (!data[userId]) {
            data[userId] = { wars: 0, helps: 0 };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`👤 Usuario ${member.user.tag} registrado en la base de datos.`);
        }
    },
};
