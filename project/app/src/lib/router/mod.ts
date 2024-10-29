import { MemberOf, ref, Signal } from "@purifyjs/core";
import { catchError } from "~/lib/catch";

const hashSignal = ref(getHash());
setInterval(() => (hashSignal.val = getHash()), 100);
window.addEventListener("hashchange", () => (hashSignal.val = getHash()));

function getHash() {
	return location.hash || "#";
}

function getPathname(hash = getHash()) {
	const index = hash.indexOf("?");
	const pathname = index > -1 ? hash.slice(1, index) : hash.slice(1);
	return pathname.startsWith("/") ? pathname.slice(1) : ``;
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

	export function hrefFrom(pathname: string, searchParams?: URLSearchParams) {
		return `#/${pathname}${searchParams?.size ? `?${searchParams}` : ""}`;
	}

	export class Client<const TRoutes extends { readonly [key: string]: Router.Route<unknown> }> {
		public readonly routes: TRoutes;
		public readonly route = pathname.derive((pathname) => {
			for (const [name, route] of Object.entries(this.routes)) {
				const data = catchError(() => route.fromPathname(pathname), [Error]).data;
				if (typeof data === "undefined") continue;
				return {
					name,
					data,
					render() {
						return route.render(data);
					},
					title() {
						return route.title(data);
					},
				} as {
					[K in keyof TRoutes]: {
						name: K;
						title(): ReturnType<TRoutes[K]["title"]>;
						data: Exclude<ReturnType<TRoutes[K]["fromPathname"]>, undefined>;
						render(): ReturnType<TRoutes[K]["render"]>;
					};
				}[keyof TRoutes];
			}

			return null;
		});

		constructor(routes: TRoutes) {
			this.routes = routes;
		}
	}

	export declare namespace Route {
		type Init<
			TData,
			TRender extends MemberOf<DocumentFragment>,
			TTitle extends MemberOf<DocumentFragment>,
		> = {
			toPathname(data: TData): string;
			fromPathname(pathname: string): TData;
			render(data: TData): TRender;
			title(data: TData): TTitle;
		};
	}
	export declare class Route<
		TData = unknown,
		TRender extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
		TTitle extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
	> {
		constructor(init: Route.Init<TData, TRender, TTitle>);

		fromPathname(pathname: string): TData | undefined;
		toPathname(data: TData): string;
		toHref(data: TData): string;
		render(data: TData): TRender;
		title(data: TData): TTitle;
	}
	Router.Route = class<
		TData = unknown,
		TRender extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
		TTitle extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
	> {
		readonly #init: Route.Init<TData, TRender, TTitle>;

		constructor(init: Route.Init<TData, TRender, TTitle>) {
			this.#init = init;
		}

		public fromPathname(pathname: string): TData | undefined {
			return catchError(() => this.#init.fromPathname(pathname), [Error]).data;
		}

		public toPathname(data: TData): string {
			return this.#init.toPathname(data);
		}

		public toHref(data: TData): string {
			return hrefFrom(this.toPathname(data));
		}

		public render(data: TData): TRender {
			return this.#init.render(data);
		}

		public title(data: TData): TTitle {
			return this.#init.title(data);
		}
	};

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
