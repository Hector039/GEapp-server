import {
	usersRepository,
	orgsEventsRepository,
} from "../repository/index.repository.js";
import passport from "passport";
import local from "passport-local";
import { createHash, isValidPass } from "../tools/utils.js";
//import mailer from "../tools/mailer.js";
import moment from "moment";

const localStrategy = local.Strategy;

const initializePassport = () => {
	passport.use(
		"signin",
		new localStrategy(
			{ passReqToCallback: true, usernameField: "email" },
			async (req, username, password, done) => {
				const { email } = req.body;

				try {
					const userOpenOrgEvent = await orgsEventsRepository.getUserOpenOrgEvent(
						email
					);
					if (userOpenOrgEvent.length === 0) {
						return done(null, false, {
							messages: "No se encontró ningún evento abierto de la Organización.",
						});
					}
					const userByEmail = await usersRepository.getUser(email);
					if (userByEmail)
						return done(null, false, { messages: "El Email ya existe." });

					const newUser = await usersRepository.saveUser({
						email,
						password: createHash(password),
						orgEventId: userOpenOrgEvent[0]._id,
					});

					//await mailer({ mail: email, name: firstName }, `Bienvenido!`)
					return done(null, newUser);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);

	passport.use(
		"login",
		new localStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					const user = await usersRepository.getUser(email);

					if (user === null)
						return done(null, false, { messages: "El Usuario no existe." });

					if (!user.orgEventId.projectId || !user.orgEventId)
						return done(null, false, {
							messages: "El evento o el proyecto está cerrado.",
						});

					if (user.status === false)
						return done(null, false, {
							messages: "Usuario no verificado. Revisa tu email y actívalo",
						});
					if (!isValidPass(password, user.password))
						return done(null, false, {
							messages: "Usuario o contraseña incorrecto.",
						});

					await usersRepository.updateUserField(user._id, "lastLogin", moment());
					return done(null, user);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser(async (user, done) => {
		try {
			const userDeserialized = await usersRepository.getUser(user.id);
			done(null, userDeserialized);
		} catch (error) {
			done(error, null);
		}
	});
};

export default initializePassport;
