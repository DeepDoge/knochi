import { Template, customTag, populate, tags } from "cherry-ts"
import { globalSheet } from "./styles"

type Route<
	TPattern extends Route.Pattern = Route.Pattern,
	TRender extends Template.MemberOf<Element> = Template.MemberOf<Element>,
> = {
	pattern: TPattern
	render(params: {
		[K in Exclude<TPattern[number], string>[number]]: string
	}): TRender
}

namespace Route {
	export type Pattern = (string | Pattern.Parameter)[]
	export namespace Pattern {
		export type Parameter = [string]
	}

	export type Render<TPattern extends Pattern> = (params: {
		[K in Exclude<TPattern[number], string>[number]]: string
	}) => Template.MemberOf<Element>

	export type InferPathname<
		TPattern extends Pattern,
		TResult extends string = ``,
	> = TPattern extends [infer TCurrent, ...infer TRest extends Pattern]
		? TCurrent extends string
			? InferPathname<TRest, `${TResult}${TCurrent}`>
			:
					| InferPathname<TRest, `${TResult}${string}${string}`>
					| InferPathname<TRest, `${TResult}${""}`>
		: TPattern extends [infer TCurrent]
			? TCurrent extends string
				? `${TResult}${TCurrent}`
				: `${TResult}${string}${string}` | `${TResult}${""}`
			: TResult
}

function route<const TPattern extends Route.Pattern>(pattern: TPattern) {
	return <TRender extends Route.Render<TPattern>>(render: TRender) => ({
		pattern,
		render,
	})
}

const routes = [
	route(["/profile/", ["address"], "/hello"])(({ address }) => {
		return `profile ${address}`
	}),
	route(["/"])(() => {
		return `home`
	}),
]

type Pathname = Route.InferPathname<(typeof routes)[number]["pattern"]>

export function goto(pathname: Pathname) {}

goto("/")

function patternToRegex(pattern: Route.Pattern) {
	return new RegExp(
		`^${pattern
			.map((part) => {
				if (typeof part === "string") {
					return part
				} else {
					return `(?<${part[0]}>[^/]+)`
				}
			})
			.join("")}$`,
	)
}

const routerTag = customTag("x-router")
const router = routerTag()
{
	const { slot } = tags
	const dom = router.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(globalSheet)
	populate(dom, [slot()])

	function findFirstMathingRoute(pathname: Pathname) {
		return routes.find((route) => {
			const { pattern } = route
			let offset = 0
			const matches = pattern.every((part) => {
				if (typeof part === "string") {
					return (
						pathname.substring(offset, offset + part.length) ===
						part
					)
				} else {
				}
			})
			return matches
		})
	}
}
