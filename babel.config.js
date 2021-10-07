module.exports = function (api) {
	api.cache(true);
	return {
		env: {
			test: {
				plugins: [
					'@babel/plugin-transform-runtime',
				],
			},
		},
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
