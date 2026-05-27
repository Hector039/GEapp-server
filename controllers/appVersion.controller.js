export default class AppVersionController {
	getVersion = async (req, res, next) => {
		res.status(200).json({
			latestVersion: process.env.LATEST_VERSION, // La última que subiste a las tiendas
			minimumRequired: process.env.MINIMUM_VERSION, // Si el usuario tiene menos de esto, no puede usar la app
			storeUrlAndroid: process.env.STORE_ANDROID_URL,
			storeUrlIos: process.env.STORE_IOS_URL,
		});
	};
}
