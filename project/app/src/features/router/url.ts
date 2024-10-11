import { computed, ref, Signal } from "@purifyjs/core";

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

export const currentPathname = hashSignal.derive(getPathname);
const currentSearch = hashSignal.derive(getSearch);
const currentSearchParams = currentSearch.derive(getSearchParams);

export function hrefFromPath(pathname: string) {
	return computed(() => {
		return `#${pathname}?${currentSearchParams.val}`;
	});
}

export class SearchParamsSignal<T extends string> extends Signal.State<T | (string & {}) | null> {
	public readonly name: string;

	constructor(name: string) {
		super(currentSearchParams.val.get(name), (set) => {
			const unfollow = currentSearchParams.follow((searchParams) => {
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
			const pathname = currentPathname.val;
			const searchParams = new URLSearchParams(currentSearchParams.val);
			if (value === null) {
				searchParams.delete(this.name);
			} else {
				searchParams.set(this.name, value);
			}

			return `#${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
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

		const href = `#${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
		hashSignal.val = location.hash = href;
		super.val = value;
	}
}
