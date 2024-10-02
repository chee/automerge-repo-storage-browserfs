import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
	// disable this line before running benchmarks
	"vitest.config.ts",
	{
		extends: "vitest.config.ts",
		test: {
			includeTaskLocation: true,
			browser: {
				enabled: true,
				name: "chromium",
				provider: "playwright",
				providerOptions: {},
			},
		},
	},
	{
		extends: "vitest.config.ts",
		test: {
			includeTaskLocation: true,
			browser: {
				enabled: true,
				name: "firefox",
				provider: "playwright",
				providerOptions: {},
			},
		},
	},
	// safari is not supported yet
	// {
	// 	extends: "vite.config.ts",
	// 	test: {
	// 		includeTaskLocation: true,
	// 		browser: {
	// 			enabled: true,
	// 			name: "safari",
	// 			provider: "webdriverio",
	// 			providerOptions: {},
	// 		},
	// 	},
	// },
])
