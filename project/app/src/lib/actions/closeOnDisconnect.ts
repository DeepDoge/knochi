import { Lifecycle } from "@purifyjs/core";

export function closeOnDisconnect(): Lifecycle.OnConnected<HTMLDialogElement> {
	return (element) => () => element.close();
}
