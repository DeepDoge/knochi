export class TypedChannel<T extends unknown> {
	#channel: MessageChannel;
	public get listenPort() {
		return this.#channel.port2;
	}
	public get postPort() {
		return this.#channel.port1;
	}

	constructor() {
		this.#channel = new MessageChannel();
	}

	public post(message: T): void {
		this.#channel.port1.postMessage(message);
	}

	public listen(listener: (value: T) => void): TypedChannel.Unlisten {
		const handler = (value: unknown) => {
			listener(value as T);
		};

		this.#channel.port2.addEventListener("message", handler);

		return () => {
			this.#channel.port2.removeEventListener("message", handler);
		};
	}
}

export namespace TypedChannel {
	export type Unlisten = () => void;
}
