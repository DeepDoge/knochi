import { computed, ref, Signal } from "purify-js";

function getHash() {
	return location.hash || "#";
}

const hash = ref(getHash());
setInterval(() => (hash.val = getHash()), 100);
window.addEventListener("hashchange", () => (hash.val = getHash()));

export const currentPathname = hash.derive((hash) => {
	const index = hash.indexOf("?");
	const pathname = index > -1 ? hash.slice(1, index) : hash.slice(1);
	return pathname.startsWith("/") ? pathname : `/`;
});

const hashSearchParams = hash.derive((hash) => {
	const index = hash.indexOf("?");
	const search = index > -1 ? hash.slice(index + 1) : null;
	return new URLSearchParams(search ?? []);
});

export class SearchParamsSignal<T extends string> extends Signal.State<T | (string & {}) | null> {
	public readonly name: string;

	constructor(name: string) {
		super(hashSearchParams.val.get(name), (set) => {
			const unfollow = hashSearchParams.follow((searchParams) => {
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
		return computed((add) => {
			const pathname = add(currentPathname).val;
			const searchParams = new URLSearchParams(add(hashSearchParams).val);
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
		hash.val = location.hash = this.toHref(value).val;
		super.val = value;
	}
}
