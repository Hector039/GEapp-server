import express from "express";
import indexRoute from "./routes/index.route.js";
import passport from "passport";
import initializePassport from "./passPortConfig/passport.config.js";
import __dirname from "./tools/utils.js";
import { profilesImgPath } from "./public/data/pathProfiles.js";
import mongoose from "mongoose";
import session from "express-session";
import errorHandler from "./middlewares/customError.js";

async function startServer() {
	const app = express();

	app.disable("x-powered-by");
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.static(__dirname + "/public"));
	app.use(express.static(profilesImgPath));
	app.use(
		session({
			secret: process.env.USERCOOKIESECRET,
			resave: false,
			saveUninitialized: true,
		})
	);

	initializePassport();
	app.use(passport.initialize());
	app.use(passport.session());

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
