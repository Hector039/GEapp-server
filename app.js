import express from "express";
import rateLimit from "express-rate-limit";
import indexRoute from "./routes/index.route.js";
import passport from "passport";
import initializePassport from "./passPortConfig/passport.config.js";
import __dirname from "./tools/utils.js";
import { profilesImgPath } from "./public/data/avatar/pathProfiles.js";
import { pathImgAssets } from "./public/data/pathImgAssets.js";
import mongoose from "mongoose";
import errorHandler from "./middlewares/customError.js";

async function startServer() {
	const app = express();

	app.disable("x-powered-by");
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use(express.static(__dirname + "/public"));
	app.use(
		express.static(profilesImgPath, {
			setHeaders: (res) => {
				res.setHeader("X-Content-Type-Options", "nosniff");
				res.setHeader("Content-Disposition", "inline");
			},
		}),
	);
	app.use(
		express.static(pathImgAssets, {
			setHeaders: (res) => {
				res.setHeader("X-Content-Type-Options", "nosniff");
				res.setHeader("Content-Disposition", "inline");
			},
		}),
	);

	initializePassport();
	app.use(passport.initialize());

	app.get("/api/ping", (req, res) => {
		res.status(200).json({ ok: true });
	});

	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 100,
		message:
			"Has excedido el límite de solicitudes. Inténtalo de nuevo más tarde.",
		standardHeaders: "draft-8",
		legacyHeaders: false,
	});
	app.use(limiter);

	app.use("/", indexRoute);

	app.use(errorHandler);

	app.listen(process.env.PORT, (err) => {
		if (err) {
			console.log(err);
			return;
		}
		console.log(`Servidor escuchando en puerto ${process.env.PORT}`);
	});

	try {
		await mongoose.connect(process.env.DB_URL);
		console.log("Mongo conectado");
	} catch (error) {
		throw new Error("Error connecting to Mongo DB", error);
	}
}

startServer();
