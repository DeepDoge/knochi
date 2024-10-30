import { Lifecycle } from "@purifyjs/core";

export function useCloseOnDisconnect(): Lifecycle.OnConnected<HTMLDialogElement> {
	return (element) => () => element.close();
}
