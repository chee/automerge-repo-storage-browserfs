import {
	defineWorkspace,
	type WorkspaceProjectConfiguration,
} from "vitest/config"

const benchmark: WorkspaceProjectConfiguration[] = [
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
			},
		},
	},
]

const test = benchmark.concat([
	"vitest.config.ts",
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
			},
		},
	},
	// safari is not supported yet
	// {
	// 	extends: "vitest.config.ts",
	// 	test: {
	// 		name: "safari",
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

export default defineWorkspace(
	import.meta.env.MODE == "benchmark" ? benchmark : test
)
