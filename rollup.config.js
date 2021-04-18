import { terser } from 'rollup-plugin-terser';
import del from 'del';

export default async function ({ watch }) {
	const outputDir = 'dist';
	const name = 'fledge';

	await del(outputDir);

	const builds = [];

	// Main
	builds.push({
		input: 'src/index.js',
		output: [
			{
				dir: `${outputDir}/esm/`,
				format: 'esm',
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
			},
			{
				dir: `${outputDir}/cjs/`,
				format: 'cjs',
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
			},
		],
	});

	// Minified iife
	builds.push({
		input: `${outputDir}/esm/index.js`,
		plugins: [
			terser({
				compress: { ecma: 2019 },
			}),
		],
		output: {
			file: `${outputDir}/iife/index.min.js`,
			format: 'iife',
			esModule: false,
			name,
		},
	});

	return builds;
}
