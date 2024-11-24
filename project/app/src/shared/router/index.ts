import { MemberOf, ref, Signal } from "@purifyjs/core";
import { PromiseOrValue } from "~/shared/types/promise";

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

export type RouteRender = MemberOf<ParentNode>;

export type RouteConstructor<T = unknown> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): Route<T>;
	parsePathname(pathname: string): T;
};

export abstract class Route<T = unknown> {
	public readonly pathname: string;
	public readonly data: T;

	constructor(pathname: string, data: T) {
		this.data = data;
		this.pathname = pathname;
	}

	public abstract title(): PromiseOrValue<string>;
	public abstract render(): PromiseOrValue<RouteRender>;
	public abstract renderHeader(): PromiseOrValue<RouteRender>;

	public toHref(): string {
		return Router.hrefFrom(this.pathname, getSearchParams());
	}
}

export namespace Router {
	export const pathname = hashSignal.derive(getPathname);
	export const search = hashSignal.derive(getSearch);
	export const searchParams = search.derive(getSearchParams);

	export function hrefFrom(pathname: string, searchParams?: URLSearchParams) {
		return `#/${pathname}${searchParams?.size ? `?${searchParams}` : ""}`;
	}

	export class Client<const TRoutes extends readonly RouteConstructor[]> {
		protected readonly routes: TRoutes;

		constructor(routes: TRoutes) {
			this.routes = routes;
		}

		readonly route = pathname.derive((pathname) => {
			for (const Route of this.routes) {
				try {
					return new Route(pathname);
				} catch {
					continue;
				}
			}
		});
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
