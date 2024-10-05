import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
	// {
	// 	extends: "vitest.config.ts",
	// 	test: {
	// 		name: "jsdom",
	// 		environment: "jsdom",
	// 	},
	// },
	// {
	// 	extends: "vitest.config.ts",
	// 	test: {
	// 		name: "happy-dom",
	// 		environment: "happy-dom",
	// 	},
	// },
	// {
	// 	extends: "vitest.config.ts",
	// 	test: {
	// 		name: "edge-runtime",
	// 		environment: "edge-runtime",
	// 	},
	// },
	{
		extends: "vitest.config.ts",
		test: {
			name: "chromium",
			includeTaskLocation: true,
			browser: {
				enabled: true,
				name: "chromium",
				provider: "playwright",
				providerOptions: {},
				headless: true,
			},
		},
	},
	{
		extends: "vitest.config.ts",
		test: {
			name: "firefox",
			includeTaskLocation: true,
			browser: {
				enabled: true,
				name: "firefox",
				provider: "playwright",
				providerOptions: {},
				headless: true,
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
