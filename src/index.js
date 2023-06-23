import express from 'express';
import cors from 'cors';
import postTrimer from "./middlewares/postTrimer.js";
import responseTransformer from './middlewares/responseTransformer.js';

import authRouter from './routes/auth.js';
import avatarRouter from './routes/avatar.js';
import attributeRouter from './routes/attribute.js';
import userRouter from './routes/user.js';

function main() {
    const port = process.env.PORT || 4000;

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(postTrimer);
    app.use(responseTransformer);

    const indexRouter = express.Router();
    indexRouter.get("/", (req, res) => {
        res.send("Hello World!");
    });

    // TODO Ajouter les routes ici
    indexRouter.use("/auth", authRouter);
    indexRouter.use("/avatar", avatarRouter);
    indexRouter.use("/attribute", attributeRouter);
    indexRouter.use("/user", userRouter);

    // Pour la production, on utilise un sous-dossier
    const subdirectory = process.env.SUBDIRECTORY || "/";
    app.use(subdirectory, indexRouter);

    app.listen(port, () => {
        console.log(`Server listening on port ${port}.`);
    });
}

export default main;
