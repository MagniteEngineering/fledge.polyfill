const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = async function (args) {
	const input = args.input || 'src';
	delete args.input;
	const output = args.output || 'dist';
	delete args.output;

	// Main
	return {
		input: `${input}/index.js`,
		output: {
			dir: `${output}/cjs/`,
			format: 'cjs',
		},
		plugins: [
			nodeResolve({ browser: true }),
			commonjs({
				sourceMap: false,
			}),
			babel({
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
				presets: [
					[ '@babel/preset-env', {
						targets: {
							browsers: [
								'chrome >= 61',
								'safari >=8',
								'edge >= 14',
								'ff >= 57',
								'ie >= 11',
								'ios >= 8',
							],
						},
						useBuiltIns: 'usage',
						modules: false,
						forceAllTransforms: true,
						corejs: {
							version: '3.0',
							proposals: false,
						},
					} ],
				],
			}),
		],
	};
};
