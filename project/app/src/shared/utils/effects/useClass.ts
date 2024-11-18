import { Lifecycle, Signal } from "@purifyjs/core";

export function useClass(
	classItemName: string,
	toggle?: Signal<boolean>,
): Lifecycle.OnConnected<HTMLElement> {
	if (!toggle) {
		return (element) => {
			element.classList.add(classItemName);
		};
	}

	return (element) =>
		toggle.follow((toggle) => {
			if (toggle) {
				element.classList.add(classItemName);
			} else {
				element.classList.remove(classItemName);
			}
		});
}
