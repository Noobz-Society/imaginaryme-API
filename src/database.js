import mongoose from "mongoose";

if (!process.env.DATABASE_URI) {
    console.error("La variable d'environnement DATABASE_URI n'est pas définie.");
    process.exit(1);
}

function connectToDatabase() {
    console.log(`Connexion à la base de données en cours...`);
    return mongoose.connect(process.env.DATABASE_URI);
}

export default connectToDatabase;