const express = require("express");
const postTrimer = require("./middlewares/postTrimer");
const responseTransformer = require("./middlewares/responseTransformer");

const authRouter = require("./routes/auth");

const port = process.env.PORT || 3000;

/**
 * @type {Express}
 */
const app = express();
app.use(express.json());
app.use(postTrimer);
app.use(responseTransformer);

const indexRouter = express.Router();
indexRouter.get("/", (req, res) => {
    res.send("Hello World!");
});

// TODO Ajouter les routes ici
indexRouter.use("/auth", authRouter);

// Pour la production, on utilise un sous-dossier
const subdirectory = process.env.SUBDIRECTORY || "/";
app.use(subdirectory, indexRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});