module.exports = function (api) {
	api.cache(true);
	return {
		plugins: [
			'@babel/plugin-proposal-class-properties',
			[ '@babel/plugin-proposal-object-rest-spread', {
				useBuiltIns: true,
			} ],
		],
		presets: [
			'@babel/preset-env',
			'@babel/preset-react',
		],
	};
};
