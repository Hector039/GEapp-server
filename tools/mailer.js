import nodemailer from "nodemailer";
import __dirname from "./utils.js";
import fs from "fs";

function editWord(html, originalWord, newWord) {
	const regex = new RegExp(originalWord, "g"); // 'g' para reemplazar todas las ocurrencias
	return html.replace(regex, newWord);
}

const transport = nodemailer.createTransport({
	host: "smtp.hostinger.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.MAILER_USER,
		pass: process.env.MAILER_PASSWORD,
	},
	// Tiempos de espera para evitar que el proceso se cuelgue infinitamente
	connectionTimeout: 10000, // 10 seg para conectar
	greetingTimeout: 5000, // 5 seg para el saludo SMTP
	socketTimeout: 15000, // 15 seg de inactividad
});

export async function welcomeWithActivationMailer(user) {
	let htmlTemplate = fs.readFileSync(
		"src/tools/templates/email-welcome-activation-template.html",
		"utf8",
	);
	const htmlTemplateEdited = editWord(
		htmlTemplate,
		"pathToValidation",
		`http://localhost:5000/api/users/activateuser/${user._id}`,
	);
	try {
		await transport.verify();
		console.log("El servidor está listo para enviar mails");

		if (!user.userName || !user.email)
			return "Error o falta de datos de usuario. No se envió el email.";

		await transport.sendMail({
			from: process.env.MAILER_USER,
			to: user.email,
			subject: `Bienvenido a ECO Huellas ${user.userName}!`,
			html: htmlTemplateEdited,
		});

		return;
	} catch (error) {
		throw error;
	}
}

export async function welcomeMailer(user) {
	let htmlTemplate = fs.readFileSync(
		`${__dirname}/templates/email-welcome-template.html`,
		"utf8",
	);
	try {
		await transport.verify();
		console.log("El servidor está listo para enviar mails");

		if (!user.email)
			return "Error o falta de datos de usuario. No se envió el email.";

		await transport.sendMail({
			from: process.env.MAILER_USER,
			to: user.email,
			subject: `Bienvenido a ECO Huellas!`,
			html: htmlTemplate,
		});

		return;
	} catch (error) {
		throw error;
	}
}

export async function passRestorationMailer(user, recoveryCode) {
	let htmlTemplate = fs.readFileSync(
		`${__dirname}/templates/email-passrestoration-template.html`,
		"utf8",
	);
	const htmlTemplateEdited = editWord(
		htmlTemplate,
		"restorationCode",
		recoveryCode,
	);
	try {
		await transport.verify();
		console.log("El servidor está listo para enviar mails");

		if (!recoveryCode || !user.email)
			return "Error o falta de datos de usuario. No se envió el email.";

		await transport.sendMail({
			from: process.env.MAILER_USER,
			to: user.email,
			subject: `Solicitud restauración de password ECO Huellas`,
			html: htmlTemplateEdited,
		});

		return;
	} catch (error) {
		throw error;
	}
}

export async function deactivateUserMailer(user) {
	let htmlTemplate = fs.readFileSync(
		`${__dirname}/templates/email-deactivate-user-template.html`,
		"utf8",
	);
	//const htmlTemplateEdited = editWord(htmlTemplate, 'pathToValidation', `http://localhost:5000/users/passrestoration/${user._id}/${password}`)
	try {
		await transport.verify();
		console.log("El servidor está listo para enviar mails");

		if (!user.email)
			return "Error o falta de datos de usuario. No se envió el email.";

		await transport.sendMail({
			from: process.env.MAILER_USER,
			to: user.email,
			subject: `Confirmación de baja de ECO Huellas`,
			html: htmlTemplate,
		});

		return;
	} catch (error) {
		throw error;
	}
}
