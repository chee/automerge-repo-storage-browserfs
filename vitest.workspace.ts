import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
	// This will keep running your existing tests.
	// If you don't need to run those in Node.js anymore,
	// You can safely remove it from the workspace file
	// Or move the browser test configuration to the config file.
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
