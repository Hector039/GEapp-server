import { generateToken, createHash, isValidPass } from "../tools/utils.js";
//import mailer from "../tools/mailer.js";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import {
	RECOMMENDED_DAILY_STEPS,
	HOURS_TO_COUNT_STEPS,
	SESSION_REWARD,
	STREAK_REWARD,
} from "../constants/constants.js";

export default class UsersController {
	constructor(repo) {
		this.usersRepo = repo;
	}

	userSigninOrLogin = async (req, res, next) => {
		try {
			const user = req.user;
			const email = user.email;
			const avatar = user.avatar;
			const id = user._id;
			const totalSteps = user.totalSteps;
			const orgEvent = user.orgEventId;
			let token = generateToken({ id });
			res.status(200).send({
				id,
				email,
				avatar,
				totalSteps,
				orgEvent,
				token,
				RECOMMENDED_DAILY_STEPS,
				HOURS_TO_COUNT_STEPS,
				SESSION_REWARD,
				STREAK_REWARD,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserPassword = async (req, res, next) => {
		const { uid, oldPassword, newPassword } = req.body;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario con ID ${uid} no encontrado.`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}

			if (!isValidPass(oldPassword, user.password)) {
				CustomError.createError({
					message: "La contraseña anterior es incorrecta.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}

			if (isValidPass(newPassword, user.password)) {
				CustomError.createError({
					message: "La contraseña debe ser diferente a la anterior.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}
			await this.usersRepo.updateUserField(
				uid,
				"password",
				createHash(newPassword)
			);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};

	updateUserEmail = async (req, res, next) => {
		const { uid, newEmail } = req.body;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			const isEmailTaken = await this.usersRepo.isEmailTaken(newEmail);
			if (isEmailTaken) {
				CustomError.createError({
					message: `El email ${newEmail} ya está en uso.`,
					code: TErrors.CONFLICT,
					statusCode: 409,
				});
			}
			await this.usersRepo.updateUserField(uid, "email", newEmail);
			await this.usersRepo.updateUserField(uid, "status", !user.status);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};

	updateUserAvatar = async (req, res, next) => {
		const { uid } = req.params;
		const avatar = req.file;

		try {
			if (!avatar) {
				CustomError.createError({
					message: "No se recibió ningún archivo.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}
			const avatarPath = `http://${process.env.LOCAL_IP}:${process.env.PORT}/${avatar.filename}`;
			await this.usersRepo.updateUserField(uid, "avatar", avatarPath);
			res.status(200).send(avatarPath);
		} catch (error) {
			next(error);
		}
	};

	updateUserStatus = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(uid, "status", !user.status);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};

	updateUserTotalSteps = async (req, res, next) => {
		const { uid, steps } = req.body;
		try {
			if (!uid || !steps) {
				CustomError.createError({
					message: `Faltan datos o están erróneos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(
				uid,
				"totalSteps",
				user.totalSteps + parseInt(steps)
			);
			res.status(200).send({ newTotalSteps: user.totalSteps + parseInt(steps) });
		} catch (error) {
			next(error);
		}
	};

	passRestoration = async (req, res, next) => {
		const { email } = req.params;
		try {
			const user = await this.usersRepo.getUser(email);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con email ${email} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			//await mailer({ mail: email, name: user.firstName },
			//`Haz click en el enlace para restaurar tu contraseña: <a href="https://hector039.github.io/client55650/forgot/${email}">Restaurar</a>`)
			res.status(200).send(`Se envió la solicitud de restauración a ${email}`);
		} catch (error) {
			next(error);
		}
	};

	userForgotPass = async (req, res, next) => {
		const { email, password } = req.body;
		try {
			const user = await this.usersRepo.getUser(email);
			if (user === null) {
				CustomError.createError({
					message: "Usuario no encontrado.",
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			if (password.length > 8 || password.length < 6) {
				CustomError.createError({
					message: "Recuerda, entre 6 y 8 caracteres",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			if (isValidPass(password, user.password)) {
				CustomError.createError({
					message: "La contraseña debe ser diferente a la anterior.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			await this.usersRepo.updateUserField(
				user._id,
				"password",
				createHash(password)
			);
			await mailer(
				{ mail: email, name: user.firstName },
				"Se cambió tu contraseña."
			);
			res.status(200).send("Se cambió la contraseña correctamente.");
		} catch (error) {
			next(error);
		}
	};

	getNewUsersCommunity = async (req, res, next) => {
		try {
			const newCommunityUsers = await this.usersRepo.getNewUsersCommunity();
			if (!newCommunityUsers) {
				CustomError.createError({
					message: "Error recibiendo los usuarios, intenta de nuevo.",
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			res.status(200).send(newCommunityUsers);
		} catch (error) {
			next(error);
		}
	};

	getUserTotalSteps = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con ID ${uid} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			res.status(200).send({ totalSteps: user.totalSteps });
		} catch (error) {
			next(error);
		}
	};

	getTopUsers = async (req, res, next) => {
		try {
			const topUsers = await this.usersRepo.getTopUsers();
			if (!topUsers) {
				CustomError.createError({
					message: "Error recibiendo los usuarios destacados, intenta de nuevo.",
					code: TErrors.DATABASE,
					statusCode: 500,
				});
			}
			res.status(200).send(topUsers);
		} catch (error) {
			next(error);
		}
	};

	getCommunitySteps = async (req, res, next) => {
		try {
			const communitySteps = await this.usersRepo.getCommunitySteps();
			if (!communitySteps) {
				CustomError.createError({
					message: "Error recibiendo los pasos de la comunidad, intenta de nuevo.",
					code: TErrors.DATABASE,
					statusCode: 500,
				});
			}
			res.status(200).send({ communitySteps });
		} catch (error) {
			next(error);
		}
	};

	getOrgUsers = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con ID ${uid} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			if (user.org === null || !user.org) {
				CustomError.createError({
					message: `El usuario no pertenece a ninguna organización.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			const orgUsers = await this.usersRepo.getOrgUsers(user.org);
			if (!orgUsers) {
				CustomError.createError({
					message: `No se pudieron obtener los usuarios de la organización.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			res.status(200).send(orgUsers);
		} catch (error) {
			next(error);
		}
	};
}
