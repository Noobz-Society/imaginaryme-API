// Initialise les variables d'environnement
require("dotenv").config();

if (!process.env.JWT_SECRET_TOKEN) {
    console.error("JWT_SECRET_TOKEN not set.");
    process.exit(1);
}

// Initialise la base de données
const connectToDatabase = require("./src/database");

connectToDatabase().then(() => {
    console.log("Connexion à la base de données réussie.");

    // Initialise le serveur
    require("./src/index");
}).catch((err) => {
    console.error(err);
});
