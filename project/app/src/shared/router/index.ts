import { MemberOf, ref, Signal } from "@purifyjs/core";
import { catchError } from "~/shared/utils/catch";

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

	export class Client<const TRoutes extends { readonly [key: string]: Router.Route }> {
		public readonly routes: TRoutes;
		public readonly route = pathname.derive((pathname) => {
			for (const [name, route] of Object.entries(this.routes)) {
				const data = catchError(() => route.fromPathname(pathname), [Error]).data;
				if (typeof data === "undefined") continue;
				return {
					name,
					data,
					title: route.title(data),
					render() {
						return route.render(data);
					},
					renderHeaderEnd() {
						return route.renderHeaderEnd(data);
					},
				} as {
					[K in keyof TRoutes]: {
						name: K;
						data: Exclude<ReturnType<TRoutes[K]["fromPathname"]>, undefined>;
						title: ReturnType<TRoutes[K]["title"]>;
						render(): ReturnType<TRoutes[K]["render"]>;
						renderHeaderEnd(): ReturnType<TRoutes[K]["renderHeaderEnd"]>;
					};
				}[keyof TRoutes];
			}

			return null;
		});

		constructor(routes: TRoutes) {
			this.routes = routes;
		}
	}

	export type RouteInit<
		TDataIn,
		TDataOut extends TDataIn,
		TRender extends MemberOf<DocumentFragment>,
		TTitle extends MemberOf<DocumentFragment>,
	> = {
		toPathname(data: TDataIn): string;
		fromPathname(pathname: string): TDataOut;
		render(data: TDataOut): TRender;
		renderHeaderEnd?(data: TDataOut): MemberOf<DocumentFragment>;
		title(data: TDataOut): TTitle;
	};

	export class Route<
		TDataIn = unknown,
		TDataOut extends TDataIn = TDataIn,
		TRender extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
		TTitle extends MemberOf<DocumentFragment> = MemberOf<DocumentFragment>,
	> {
		readonly #init: RouteInit<TDataIn, TDataOut, TRender, TTitle>;

		constructor(init: RouteInit<TDataIn, TDataOut, TRender, TTitle>) {
			this.#init = init;
		}

		public fromPathname(pathname: string): TDataOut | undefined {
			return catchError(() => this.#init.fromPathname(pathname), [Error]).data;
		}

		public toPathname(data: TDataIn): string {
			return this.#init.toPathname(data);
		}

		public toHref(data: TDataIn): string {
			return hrefFrom(this.toPathname(data));
		}

		public render(data: TDataOut): TRender {
			return this.#init.render(data);
		}

		public renderHeaderEnd(data: TDataOut) {
			return this.#init.renderHeaderEnd?.(data) ?? null;
		}

		public title(data: TDataOut): TTitle {
			return this.#init.title(data);
		}
	}

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
			return hashSignal.derive((hash) => {
				const pathname = getPathname(hash);
				const searchParams = new URLSearchParams(getSearch(hash) ?? "");
				if (value === null) {
					searchParams.delete(this.name);
				} else {
					searchParams.set(this.name, value);
				}

				const href = hrefFrom(pathname, searchParams);
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