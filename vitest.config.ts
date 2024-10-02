import {defineConfig} from "vitest/config"
import wasm from "vite-plugin-wasm"

export default defineConfig({
	mode: "web",
	plugins: [wasm()],
	test: {
		environment: "jsdom",
	},
})
