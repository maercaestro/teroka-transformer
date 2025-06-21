import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto supports Vercel out of the box
		adapter: adapter(),
		alias: {
			'~': './src'
		},
		// Remove the base path for Vercel deployment (only needed for GitHub Pages)
		// paths: {
		// 	base: process.env.NODE_ENV === 'production' ? '/transformer-explainer' : ''
		// }
	}
};

export default config;
