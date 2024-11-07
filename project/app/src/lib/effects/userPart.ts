import { Lifecycle } from "@purifyjs/core";

declare global {
	interface DOMStringMap {
		part?: string;
	}
}

export function usePart(name: string): Lifecycle.OnConnected<HTMLElement> {
	return (element) => {
		element.dataset.part = name;
	};
}
