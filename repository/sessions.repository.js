import mongoose from "mongoose";

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
	};
}
