import { Lifecycle } from "@purifyjs/core";

export function useAutoSize(): Lifecycle.OnConnected<HTMLTextAreaElement> {
	return (textarea) => {
		function listener() {
			textarea.style.height = "0";
			textarea.style.height = `${textarea.scrollHeight + 1}px`;
		}
		listener();
		textarea.addEventListener("input", listener);
		return () => {
			textarea.removeEventListener("input", listener);
		};
	};
}
