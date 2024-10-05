import {defineConfig, searchForWorkspaceRoot} from "vite"
import solid from "vite-plugin-solid"
import wasm from "vite-plugin-wasm"

export default defineConfig({
	server: {
		fs: {
			allow: [
				searchForWorkspaceRoot(process.cwd()),
				searchForWorkspaceRoot(process.cwd() + "/.."),
			],
		},
	},
	plugins: [solid(), wasm()],
})
