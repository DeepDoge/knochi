import { Enhanced } from "purify-js";

export function clickClose(): Enhanced.OnConnected<HTMLDialogElement> {
	return function (element) {
		function dialogClickHandler(event: MouseEvent) {
			if (event.target !== element) return;

			const rect = element.getBoundingClientRect();
			const clickedInDialog =
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width;
			if (clickedInDialog) return;

			element.close();
		}

		element.addEventListener("click", dialogClickHandler);

		return () => {
			element.removeEventListener("click", dialogClickHandler);
		};
	};
}
