
# 🤖 W&H Discord Bot

Bot para la gestión de estadísticas y rangos dentro de un clan de Discord. Incluye sistema de ayuda (`helps`), participación en guerras (`wars`) y ranking en tiempo real.

---

## 📦 Requisitos

- Node.js v18+ recomendado
- Un bot registrado en el [Discord Developer Portal](https://discord.com/developers/applications)
- Token de bot
- Git (opcional para clonación/repositorio)

---

## ⚙️ Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
TOKEN=tu_token_del_bot
CLIENT_ID=tu_id_de_aplicacion
GUILD_ID=tu_id_del_servidor
TOP_ALLOWED_ROLES=rolid1,rolid2
RANKING_CHANNEL_ID=canalid_donde_enviar_el_embed
COMMAND_CHANNEL_ID=canalid_autorizado
ROLE_IDS=rol1,rol2
CHANNEL_ID=canal_notificaciones_rango
```

---

## 🧠 Comandos Principales

| Comando            | Descripción                                          |
|--------------------|------------------------------------------------------|
| `/help`            | Muestra la ayuda general del bot                     |
| `/asignar`         | Asigna wars y helps a un solo usuario                |
| `/asignar-multiple`| Asigna wars y helps a múltiples usuarios             |
| `/stats`           | Muestra wars, helps y rango actual del usuario       |
| `/top`             | Muestra el top 10 de wars y helps                    |
| `/inicializartop`  | Inicializa el mensaje de ranking (requiere admin)   |

---

## 📁 Estructura del Proyecto

```bash
.
├── commands/             # Comandos slash
├── events/               # Eventos del cliente
├── utils/                # Funciones auxiliares
├── data/                 # Archivos JSON persistentes
├── config/               # Archivos de configuración
├── index.js              # Punto de entrada principal
├── iniciar.bat           # Script para iniciar fácilmente
├── .env                  # Variables de entorno (no subir a Git)
├── .gitignore            # Ignorar carpetas/archivos sensibles
```

---

## 🚀 Ejecutar el Bot

```bash
node index.js
```

O si tienes el archivo `iniciar.bat`:

```bash
./iniciar.bat
```

---

## 🛡️ Roles y Rangos

El archivo `ROLE_RANKS` define los rangos según los IDs de rol, por ejemplo:

```js
const ROLE_RANKS = {
    '1381773497168040107': '🔰 - Iniciado',
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
    '1347371372698927164': '👑 - Crown of the Abyss'
};
```

Este objeto permite mapear los roles actuales a rangos mostrados en `/stats` y ranking.

---

## 📊 Ranking Automático

Usa `/inicializartop` una vez para crear el mensaje base del ranking. El ranking se actualiza automáticamente cuando se asignan nuevos valores.

---

## 🧑‍💻 Autor

Proyecto desarrollado por Gian Toledo.  
Uso exclusivo para comunidad interna.

---

## 📜 Licencia

Este proyecto es de uso cerrado. No se permite su redistribución pública sin consentimiento del autor.
