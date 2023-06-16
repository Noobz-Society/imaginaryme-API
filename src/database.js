/**
 * @type {Mongoose}
 */
const mongoose = require("mongoose");

if (!process.env.DATABASE_URI) {
    console.error("La variable d'environnement DATABASE_URI n'est pas définie.");
    process.exit(1);
}

/**
 * Connexion à la base de données
 * @returns {Promise<Mongoose>}
 */
function connectToDatabase() {
    console.log(`Connexion à la base de données ${process.env.DATABASE_URI}.`);
    return mongoose.connect(process.env.DATABASE_URI);
}

module.exports = connectToDatabase;
