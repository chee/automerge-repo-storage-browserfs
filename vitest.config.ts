import {defineConfig} from "vitest/config"

export default defineConfig({
	mode: "web",
	plugins: [],
	test: {
		environment: "jsdom",
	},
})
