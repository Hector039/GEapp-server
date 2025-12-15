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
			sessionExists.steps = sessionExists.steps + session.steps;
			return await sessionExists.save();
		}
		const newSession = {
			user: new mongoose.Types.ObjectId(session.uid),
			steps: session.steps || 0,
			date: session.dateISO,
		};
		let newSessionSaved = new this.sessionsModel(newSession).save();
		return newSessionSaved;
	};

	getDataChart = async (uid, filter) => {
		// 1. Configuración de Rango y Agrupación
		const endDate = new Date();
		// Establecer la fecha actual al inicio del día en UTC para un rango preciso
		endDate.setUTCHours(0, 0, 0, 0);
		let startDate = new Date(endDate);
		let groupPeriod = null;
		let expectedPeriods = 0; // Cuántos elementos esperamos en el resultado final

		switch (filter) {
			case "Semana":
				// Rango: Últimos 7 días (excluyendo el día de hoy, si aún no terminó)
				startDate.setDate(startDate.getDate() - 7);
				expectedPeriods = 7;
				// Agrupar por el día exacto (una sesión por día garantiza esto)
				groupPeriod = {
					year: { $year: "$date" },
					month: { $month: "$date" },
					day: { $dayOfMonth: "$date" },
				};
				break;

			case "Mes":
				// Rango: Últimos 28 días (4 semanas)
				startDate.setDate(startDate.getDate() - 28);
				expectedPeriods = 4; // Esperamos 4 semanas
				// Agrupar por semana del año
				groupPeriod = { year: { $year: "$date" }, week: { $week: "$date" } };
				break;

			case "Año":
				// Rango: Últimos 12 meses
				// Retroceder 12 meses
				startDate.setMonth(startDate.getMonth() - 12);
				expectedPeriods = 12; // Esperamos 12 meses
				// Agrupar por mes del año
				groupPeriod = { year: { $year: "$date" }, month: { $month: "$date" } };
				break;
		}

		// 2. Pipeline de Agregación de MongoDB
		const aggregationPipeline = [
			// Filtrar por usuario y rango de fechas
			{
				$match: {
					user: new mongoose.Types.ObjectId(uid),
					date: { $gte: startDate },
				},
			},
			// Agrupar los pasos por el período de tiempo (día, semana o mes)
			{
				$group: {
					_id: groupPeriod,
					totalSteps: { $sum: "$steps" },
					// La fecha mínima es suficiente para la clave de ordenamiento
					date: { $min: "$date" },
				},
			},
			// Ordenar por fecha ascendente
			{ $sort: { date: 1 } },
		];

		const aggregatedData = await this.sessionsModel
			.aggregate(aggregationPipeline)
			.exec();

		// 3. Post-Procesamiento: Calcular Porcentajes y Rellenar Ceros

		// Mapear los datos agregados a un objeto clave-valor para acceso rápido
		const dataMap = new Map();
		aggregatedData.forEach((item) => {
			let key = "";

			if (filter === "Semana") {
				// Clave: AAAA-MM-DD
				key = `${item._id.year}-${item._id.month}-${item._id.day}`;
			} else if (filter === "Mes") {
				// Clave: AAAA-Semana (usando la semana como ID)
				key = `${item._id.year}-${item._id.week}`;
			} else if (filter === "Año") {
				// Clave: AAAA-MM
				key = `${item._id.year}-${item._id.month}`;
			}

			// Calcular el porcentaje y guardar como valor
			const percentage = Math.min(
				100,
				Math.round((item.totalSteps / RECOMMENDED_DAILY_STEPS) * 100)
			);
			dataMap.set(key, percentage);
		});

		// 4. Generar el Array Final de Porcentajes (Incluyendo los 0)
		let finalPercentages = [];
		const stepDate = new Date(startDate);

		// Rellenar para el caso "Semana" (7 días)
		if (filter === "Semana") {
			for (let i = 0; i < expectedPeriods; i++) {
				// Asegurarse de que el loop no incluya el día de hoy, si el rango es 7 días.
				// Creamos la clave para buscar en el mapa
				const key = `${stepDate.getUTCFullYear()}-${
					stepDate.getUTCMonth() + 1
				}-${stepDate.getUTCDate()}`;

				// Si la clave existe en el mapa, usamos el porcentaje; si no, es 0
				const percentage = dataMap.get(key) || 0;
				finalPercentages.push(percentage);

				// Avanzamos al día siguiente
				stepDate.setUTCDate(stepDate.getUTCDate() + 1);
			}
		}

		// Rellenar para el caso "Mes" (4 semanas)
		else if (filter === "Mes") {
			// En este caso, la lógica de la semana de MongoDB no es secuencial,
			// por lo que simplemente tomamos los datos de MongoDB y rellenamos 0.
			// Asumimos que `aggregatedData` tiene hasta 4 elementos y está ordenado.

			const actualWeeks = aggregatedData.length;

			// Tomar los porcentajes reales
			finalPercentages = aggregatedData.map((item) =>
				Math.min(
					100,
					Math.round((item.totalSteps / (RECOMMENDED_DAILY_STEPS * 7)) * 100)
				)
			); // *7 porque agrupa 7 días de pasos

			// Rellenar con 0 si faltan semanas
			for (let i = actualWeeks; i < expectedPeriods; i++) {
				finalPercentages.push(0);
			}
		}

		// Rellenar para el caso "Año" (12 meses)
		else if (filter === "Año") {
			// La lógica debe generar las claves de los 12 meses a partir de `startDate`.
			for (let i = 0; i < expectedPeriods; i++) {
				// Ajustamos la fecha al mes actual del loop
				const monthDate = new Date(startDate);
				monthDate.setMonth(startDate.getMonth() + i + 1); // +1 para iniciar desde el primer mes completo

				const year = monthDate.getFullYear();
				const month = monthDate.getMonth() + 1; // 1-12
				const key = `${year}-${month}`;

				// Si la clave existe en el mapa, usamos el porcentaje; si no, es 0
				const percentage = dataMap.get(key) || 0;
				finalPercentages.push(percentage);
			}
			// Nos aseguramos de devolver solo los 12 últimos meses generados
			finalPercentages = finalPercentages.slice(-expectedPeriods);
		}

		// Devolver solo el array de porcentajes
		return finalPercentages;
	};

	/* getDataChart = async (uid, filter) => {
		// Determinar el rango de tiempo y la agrupación ($group)
		let groupPeriod = null; // El campo para agrupar en $group
		let startDate = new Date();
		startDate.setUTCHours(0, 0, 0, 0); // Resetear a inicio del día formato UTC Universal

		switch (filter) {
			case "Semana":
				// Retroceder 7 días
				startDate.setDate(startDate.getDate() - 7);
				// Agrupar por día (año, mes, día)
				groupPeriod = {
					year: { $year: "$date" },
					month: { $month: "$date" },
					day: { $dayOfMonth: "$date" },
				};
				break;

			case "Mes":
				// Retroceder 30 días
				startDate.setDate(startDate.getDate() - 30);
				// Agrupar por semana del año
				groupPeriod = { year: { $year: "$date" }, week: { $week: "$date" } };
				break;

			case "Año":
				// Retroceder 12 meses (1 año)
				startDate.setFullYear(startDate.getFullYear() - 1);
				// Agrupar por mes del año
				groupPeriod = { year: { $year: "$date" }, month: { $month: "$date" } };
				break;
		}

		// Crear el Pipeline de Agregación de MongoDB
		const aggregationPipeline = [
			// $match: Filtrar por usuario y rango de fechas
			{
				$match: {
					user: new mongoose.Types.ObjectId(uid), // Asegurarse de que es un ObjectId
					date: { $gte: startDate },
				},
			},
			// $group: Agrupar los pasos por el período de tiempo definido
			{
				$group: {
					_id: groupPeriod,
					totalSteps: { $sum: "$steps" },
					date: { $min: "$date" }, // Obtener la fecha para etiquetar
				},
			},
			// $sort: Ordenar por fecha ascendente
			{ $sort: { date: 1 } },
		];

		// Ejecutar el pipeline
		const aggregatedData = await this.sessionsModel
			.aggregate(aggregationPipeline)
			.exec();

		// Formatear la respuesta para el frontend (como lo espera React Native)
		const formattedData = aggregatedData.map((item) => {
			let label = "";

			// Generar etiquetas basadas en el filtro
			if (filter === "Semana") {
				label = `${item._id.day}/${item._id.month}`; // Día/Mes
			} else if (filter === "Mes") {
				// Esto es más complejo en la práctica, aquí simplificamos
				// usando el índice o la fecha de inicio del grupo.
				label = `Semana ${item._id.week}`;
			} else if (filter === "Año") {
				// Obtener el nombre del mes
				const monthNames = [
					"Ene",
					"Feb",
					"Mar",
					"Abr",
					"May",
					"Jun",
					"Jul",
					"Ago",
					"Sep",
					"Oct",
					"Nov",
					"Dic",
				];
				label = monthNames[item._id.month - 1];
			}

			return {
				label: label,
				steps: item.totalSteps,
			};
		});

		return {
			filter: filter,
			data: formattedData,
		};
	}; */
}
