import mongoose from "mongoose";
import { RECOMMENDED_DAILY_STEPS } from "../constants/constants.js";

export default class SessionsRepository {
	constructor(model) {
		this.sessionsModel = model;
	}

	getUserInfoRewards = async (uid, yesterday) => {
		let session = await this.sessionsModel.findOne({
			user: uid,
			date: yesterday,
		});
		return session;
	};

	saveUserSession = async (session) => {
		let sessionExists = await this.sessionsModel.findOne({
			user: session.uid,
			date: session.dateISO,
		});
		if (sessionExists) {
			sessionExists.steps = sessionExists.steps + session.newSteps;
			return await sessionExists.save();
		}
		const newSession = {
			user: new mongoose.Types.ObjectId(session.uid),
			steps: session.newSteps || 0,
			date: session.dateISO,
		};
		let newSessionSaved = new this.sessionsModel(newSession).save();
		return newSessionSaved;
	};

	getDataChart = async (uid, filter) => {
		// 1. Configuración de Rango y Consistencia en UTC
		const endDate = new Date();
		endDate.setUTCHours(0, 0, 0, 0); // Inicio del día de hoy en UTC

		let startDate = new Date(endDate);
		let groupPeriod = null;
		let expectedPeriods = 0;

		switch (filter) {
			case "Semana":
				// Últimos 7 días corridos (sin contar hoy que está incompleto)
				startDate.setUTCDate(startDate.getUTCDate() - 7);
				expectedPeriods = 7;
				groupPeriod = {
					year: { $year: "$date" },
					month: { $month: "$date" },
					day: { $dayOfMonth: "$date" },
				};
				break;

			case "Mes":
				// 4 semanas exactas (28 días) hacia atrás
				startDate.setUTCDate(startDate.getUTCDate() - 28);
				expectedPeriods = 4;
				// Agrupamos por día para luego agrupar dinámicamente en bloques de 7 días reales en JS
				groupPeriod = {
					year: { $year: "$date" },
					month: { $month: "$date" },
					day: { $dayOfMonth: "$date" },
				};
				break;

			case "Año":
				// Últimos 12 meses. Vamos al día 1 del mes hace 12 meses para abarcar meses completos
				startDate.setUTCMonth(startDate.getUTCMonth() - 11);
				startDate.setUTCDate(1); // Empezar desde el día 1 de ese mes lejano
				expectedPeriods = 12;
				groupPeriod = {
					year: { $year: "$date" },
					month: { $month: "$date" },
				};
				break;
		}

		// 2. Pipeline de Agregación de MongoDB
		const aggregationPipeline = [
			{
				$match: {
					user: new mongoose.Types.ObjectId(uid),
					date: { $gte: startDate, $lt: endDate }, // Filtramos estrictamente el rango
				},
			},
			{
				$group: {
					_id: groupPeriod,
					totalSteps: { $sum: "$steps" },
				},
			},
		];

		const aggregatedData = await this.sessionsModel
			.aggregate(aggregationPipeline)
			.exec();

		// 3. Creación de Mapas de Datos para búsqueda eficiente
		const dataMap = new Map();

		if (filter === "Semana" || filter === "Mes") {
			// Guardamos los pasos indexados por día 'AAAA-MM-DD'
			aggregatedData.forEach((item) => {
				const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
				dataMap.set(key, item.totalSteps);
			});
		} else if (filter === "Año") {
			// Guardamos los pasos indexados por mes 'AAAA-MM'
			aggregatedData.forEach((item) => {
				const key = `${item._id.year}-${item._id.month}`;
				dataMap.set(key, item.totalSteps);
			});
		}

		// 4. Generación Dinámica del Array Final (Asegura orden y rellena ceros correctamente)
		let finalPercentages = [];
		let stepDate = new Date(startDate);

		// --- CASO SEMANA ---
		if (filter === "Semana") {
			for (let i = 0; i < expectedPeriods; i++) {
				const key = `${stepDate.getUTCFullYear()}-${stepDate.getUTCMonth() + 1}-${stepDate.getUTCDate()}`;
				const steps = dataMap.get(key) || 0;

				const percentage = Math.min(
					100,
					Math.round((steps / RECOMMENDED_DAILY_STEPS) * 100),
				);
				finalPercentages.push(percentage);

				stepDate.setUTCDate(stepDate.getUTCDate() + 1);
			}
		}

		// --- CASO MES (4 Bloques de 7 días) ---
		else if (filter === "Mes") {
			for (let w = 0; w < expectedPeriods; w++) {
				let totalStepsInWeek = 0;

				// Sumamos los pasos de los próximos 7 días para conformar una "Semana" real y secuencial
				for (let d = 0; d < 7; d++) {
					const key = `${stepDate.getUTCFullYear()}-${stepDate.getUTCMonth() + 1}-${stepDate.getUTCDate()}`;
					totalStepsInWeek += dataMap.get(key) || 0;
					stepDate.setUTCDate(stepDate.getUTCDate() + 1);
				}

				// Meta de la semana = Meta diaria * 7 días
				const targetSteps = RECOMMENDED_DAILY_STEPS * 7;
				const percentage = Math.min(
					100,
					Math.round((totalStepsInWeek / targetSteps) * 100),
				);
				finalPercentages.push(percentage);
			}
		}

		// --- CASO AÑO ---
		else if (filter === "Año") {
			for (let m = 0; m < expectedPeriods; m++) {
				const year = stepDate.getUTCFullYear();
				const month = stepDate.getUTCMonth() + 1;
				const key = `${year}-${month}`;

				const totalStepsInMonth = dataMap.get(key) || 0;

				// Calculamos cuántos días tiene ESTE mes específico para una meta exacta (ej: Febrero vs Marzo)
				const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
				const targetSteps = RECOMMENDED_DAILY_STEPS * daysInMonth;

				const percentage = Math.min(
					100,
					Math.round((totalStepsInMonth / targetSteps) * 100),
				);
				finalPercentages.push(percentage);

				// Avanzar al siguiente mes
				stepDate.setUTCMonth(stepDate.getUTCMonth() + 1);
			}
		}

		return finalPercentages;
	};
}
