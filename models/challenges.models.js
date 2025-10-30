import mongoose from "mongoose";

const triviaChallengeCollection = "triviaChallenges";
const triviaChallengeSchema = new mongoose.Schema({
	title: { type: String, required: true },
	descr: { type: String, required: true },
	icon: { type: String, required: true },
	reward: { type: Number, default: 100 },
	date: { type: Date, default: Date.now },
	question: { type: String, required: true },

	// Opciones de respuesta (Array de Strings)
	options: {
		type: [String], // Array de strings, ejemplo: ["opción A", "opción B", "opción C", "opción D"]
		validate: {
			// Validación: asegurar al menos 2 opciones
			validator: function (v) {
				return v.length >= 2;
			},
			message: (props) =>
				`La pregunta debe tener al menos 2 opciones, tienes ${props.value.length}`,
		},
		required: true,
	},

	// Almacenar la Respuesta Correcta (Índice o Texto)
	// ----------------------------------------------------
	// Opción 1: Índice de la respuesta dentro del array 'options' (Recomendada)
	correctOptionIndex: {
		type: Number,
		required: true,
		min: 0, // El índice no puede ser negativo
		// Se podría añadir un validador para asegurar que el índice existe en 'options'
	},
});

const triviaChallengesModel = mongoose.model(
	triviaChallengeCollection,
	triviaChallengeSchema
);

export default triviaChallengesModel;
