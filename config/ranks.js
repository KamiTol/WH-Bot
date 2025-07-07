const roleHierarchy = [
    '1347371372698927164', // Crown of the Abyss
    '1382568803069591682',  // Counselor of the Abyss
    '1382568902105501767', // Disciple of the Abyss
    '1382568903191957585', // Abyss Knight
    '1382580470335799436', // Abyss Soul
    '1382579269800038444', // Caballero oscuro
    '1382579270940884992', // Centinela oscuro
    '1382579268554588200', // Guerrero oscuro
    '1382582836388827179', // Sacerdote oscuro
    '1382582840255844352', // Guardian
    '1382568905213476894', // Escudero
    '1382568905297494146', // Aspirante
    '1381773497168040107' // Iniciado
  ];

  const rankNameToId = {
    '⚔️ Caballero Oscuro': '1382579269800038444',
    '🧝 Centinela Oscuro': '1382579270940884992',
    '👹 Guerrero Oscuro': '1382579268554588200',
    '🔆 Sacerdote Oscuro': '1382582836388827179',
    '💢 Guardian':          '1382582840255844352',
    '🛡️ Escudero':          '1382568905213476894',
    '🌑 Aspirante':         '1382568905297494146'
  };

module.exports = { 
  roleHierarchy,
  rankNameToId
};