import {connectToDatabase} from "./src/database.js";
import main from "./src/index.js";

// Vérifie que les variables d'environnement nécessaires sont bien définies
if (!process.env.JWT_SECRET_TOKEN) {
    console.error("JWT_SECRET_TOKEN not set.");
    process.exit(1);
}

// const connectToDatabase = require("./src/database");
try {
    await connectToDatabase();

    console.log("Connexion à la base de données réussie.");

    // Initialise le serveur
    main();
} catch (err) {
    console.error(err);
}
