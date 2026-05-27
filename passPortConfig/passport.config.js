import {
	usersRepository,
	orgsEventsRepository,
} from "../repository/index.repository.js";
import passport from "passport";
import local from "passport-local";
import { createHash, isValidPass } from "../tools/utils.js";

const localStrategy = local.Strategy;

const initializePassport = () => {
	passport.use(
		"signin",
		new localStrategy(
			{ passReqToCallback: true, usernameField: "email" },
			async (req, username, password, done) => {
				const { email, invitationCode } = req.body;

				try {
					const userOpenOrgEvent =
						await orgsEventsRepository.getUserOpenOrgEvent(invitationCode);
					if (userOpenOrgEvent.length === 0) {
						return done(null, false, {
							messages: "No se encontró ningún evento de tu Organización.",
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

					return done(null, newUser);
				} catch (error) {
					return done(error, null);
				}
			},
		),
	);

	passport.use(
		"login",
		new localStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					const user = await usersRepository.getUserWithPassword(email);

					if (!user)
						return done(null, false, { messages: "Credenciales inválidas." });

					if (!isValidPass(password, user.password))
						return done(null, false, { messages: "Credenciales inválidas." });

					if (
						!user.orgEventId.projectId ||
						!user.orgEventId.projectId.isOpen ||
						!user.orgEventId.isOpen ||
						!user.orgEventId
					)
						return done(null, false, {
							messages: "El evento o el proyecto está cerrado.",
						});

					await usersRepository.updateUserField(user._id, "lastLogin", new Date());
					return done(null, user);
				} catch (error) {
					return done(error, null);
				}
			},
		),
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
