import mongoose from "mongoose";

if (!process.env.DATABASE_URI) {
    console.error("La variable d'environnement DATABASE_URI n'est pas définie.");
    process.exit(1);
}

/**
 * Connects to the database and returns the connection
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectToDatabase() {
    console.log(`Connexion à la base de données en cours...`);
    return (await mongoose.connect(process.env.DATABASE_URI)).connection;
}