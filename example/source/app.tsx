import {For, Suspense} from "solid-js"
import start from "./start.ts"
import {createDocumentStore, useHandle} from "automerge-repo-solid-primitives"
import {isValidAutomergeUrl} from "@automerge/automerge-repo"

const repo = await start()

type Project = {
	title: string
	items: {title: string; complete?: Date | null}[]
}

const check = (index: number, checked: boolean) => (doc: Project) => {
	doc.items[index].complete = checked ? new Date() : null
}

const title = (index: number, text: string) => (doc: Project) => {
	doc.items[index].title = text
}

const add = () => (doc: Project) => doc.items.unshift({title: "new item"})

function App() {
	const handle = useHandle<Project>(
		() => {
			const hash = location.hash.slice(1)
			if (hash && isValidAutomergeUrl(hash)) {
				return hash
			}
			const {url} = repo.create({
				title: "hello",
				items: [
					{title: "i am item"},
					{title: "i am better item", complete: new Date()},
				],
			})
			return (location.hash = url)
		},
		{repo}
	)
	const project = createDocumentStore(handle)

	return (
		<Suspense>
			<div>
				<h1>
					{project()?.title}{" "}
					<button onclick={() => handle()!.change(add())}>➕</button>
				</h1>
				<ul>
					<For each={project()?.items}>
						{(item, index) => (
							<li>
								<input
									type="checkbox"
									checked={!!item.complete}
									oninput={event =>
										handle()!.change(
											check(index(), event.target.checked)
										)
									}
								/>
								<input
									type="text"
									value={item.title}
									oninput={event =>
										handle()!.change(
											title(index(), event.target.value)
										)
									}
								/>
							</li>
						)}
					</For>
				</ul>
			</div>
		</Suspense>
	)
}

export default App
