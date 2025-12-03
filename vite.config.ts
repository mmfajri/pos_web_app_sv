import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		sourcemap: true
	},
	server: {
		watch: {
			ignored: ['**/.vscode/**', '**/.vscode/vscode-chrome-debug-userdatadir/**']
		}
	},
	optimizeDeps: {
		exclude: ['@sveltejs/kit', '@tailwindcss/vite']
	}
});
