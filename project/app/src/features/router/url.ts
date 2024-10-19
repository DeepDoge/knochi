import { ref, Signal } from "@purifyjs/core";
import { Feed } from "~/features/post/utils/Feed";
import { Address } from "~/utils/solidity/primatives";

const hashSignal = ref(getHash());
setInterval(() => (hashSignal.val = getHash()), 100);
window.addEventListener("hashchange", () => (hashSignal.val = getHash()));

function getHash() {
	return location.hash || "#";
}

function getPathname(hash = getHash()) {
	const index = hash.indexOf("?");
	const pathname = index > -1 ? hash.slice(1, index) : hash.slice(1);
	return pathname.startsWith("/") ? pathname : `/`;
}

function getSearch(hash = getHash()) {
	const index = hash.indexOf("?");
	const search = index > -1 ? hash.slice(index + 1) : null;
	return search;
}

function getSearchParams(search = getSearch()) {
	return new URLSearchParams(search ?? []);
}

export namespace Router {
	export const pathname = hashSignal.derive(getPathname);
	export const search = hashSignal.derive(getSearch);
	export const searchParams = search.derive(getSearchParams);

	function hrefFrom(pathname: string, searchParams?: URLSearchParams) {
		return `#${pathname}${searchParams?.size ? `?${searchParams}` : ""}`;
	}

	export type Route<TData = unknown> = {
		parse(pathname: string): TData;
		toHref(data: TData): string;
	};
	export function Route() {
		return {
			setDataParser<TData>(parse: (pathname: string) => TData) {
				return {
					setHrefGetter(toHref: (data: TData) => string) {
						return {
							create(): Route<TData> {
								return { parse, toHref };
							},
						};
					},
				};
			},
		};
	}

	export const routes = {
		profile: Route()
			.setDataParser((pathname) =>
				Address()
					.transform((address) => ({ address }))
					.parse(pathname.slice(1)),
			)
			.setHrefGetter((data) => hrefFrom(`/${data.address}`))
			.create(),
		feed: Route()
			.setDataParser((pathname) =>
				Feed.Id()
					.transform((id) => ({ id }))
					.parse(pathname.slice(1)),
			)
			.setHrefGetter((data) => hrefFrom(`/${data.id}`))
			.create(),
	} as const satisfies Readonly<Record<string, Route>>;

	export const route = pathname.derive((pathname) => {
		for (const [name, route] of Object.entries(routes)) {
			try {
				const data = route.parse(pathname);
				return {
					name,
					data,
				} as {
					[K in keyof typeof routes]: {
						readonly name: K;
						readonly data: ReturnType<(typeof routes)[K]["parse"]>;
					};
				}[keyof typeof routes];
			} catch {}
		}

		return null;
	});

	export class SearchParam<T extends string> extends Signal.State<T | (string & {}) | null> {
		public readonly name: string;

		constructor(name: string) {
			super(searchParams.val.get(name), (set) => {
				const unfollow = searchParams.follow((searchParams) => {
					const newValue = searchParams.get(name);
					if (this.val === newValue) return;
					set(newValue);
				}, true);

				return () => {
					unfollow();
				};
			});
			this.name = name;
		}

		public toHref(value: T | (string & {}) | null) {
			return hashSignal.derive(() => {
				const searchParamsValue = new URLSearchParams(searchParams.val);
				if (value === null) {
					searchParamsValue.delete(this.name);
				} else {
					searchParamsValue.set(this.name, value);
				}

				const href = hrefFrom(pathname.val, searchParamsValue);
				return href;
			});
		}

		public override get val() {
			return super.val;
		}

		public override set val(value: T | (string & {}) | null) {
			const hash = getHash();
			const pathname = getPathname(hash);
			const searchParams = getSearchParams(getSearch(hash));
			if (value === null) {
				searchParams.delete(this.name);
			} else {
				searchParams.set(this.name, value);
			}

			const href = hrefFrom(pathname, searchParams);
			hashSignal.val = location.hash = href;
			super.val = value;
		}
	}
}
