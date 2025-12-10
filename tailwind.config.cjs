/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				
			},
		},
	},
	plugins: [
		{
			'postcss-import': {},
			'tailwindcss/nesting': {},
			tailwindcss: {},
        	autoprefixer: {},
		},
		require('@tailwindcss/typography'),
	],
}
