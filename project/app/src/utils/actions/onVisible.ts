import { Lifecycle } from "@purifyjs/core";

export function onVisible(
	start: () => void | (() => void),
	options: IntersectionObserverInit = { threshold: 0 },
): Lifecycle.OnConnected {
	return (element) => {
		let visibleCache = false;
		let end: (() => void) | void | undefined;

		const observer = new IntersectionObserver((entries) => {
			const visible = Boolean(entries.at(0)?.isIntersecting);
			if (visible !== visibleCache) {
				visibleCache = visible;
				if (visible) {
					end = start();
				} else {
					end?.();
				}
			}
		}, options);

		observer.observe(element);

		return () => {
			observer.disconnect();
			end?.();
		};
	};
}
