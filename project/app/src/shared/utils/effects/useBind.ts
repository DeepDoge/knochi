import { Lifecycle, Signal } from "@purifyjs/core";

export function useBind<T, P extends keyof HTMLElement | (string & {})>(
	signal: Signal.State<T>,
	propertyName: P,
	eventName: keyof HTMLElementEventMap | (string & {}),
): Lifecycle.OnConnected<HTMLElement & { [_ in P]: T }> {
	return (element) => {
		const handler = () => (signal.val = element[propertyName]);
		element.addEventListener(eventName, handler);
		const unfollow = signal.follow((value) => (element[propertyName] = value as never), true);

		return () => {
			unfollow();
			element.removeEventListener(eventName, handler);
		};
	};
}
