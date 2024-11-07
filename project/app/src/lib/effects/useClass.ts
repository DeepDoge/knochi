import { Lifecycle } from "@purifyjs/core";

export function useClass(classItemName: string): Lifecycle.OnConnected<HTMLElement> {
	return (element) => {
		element.classList.add(classItemName);
	};
}
