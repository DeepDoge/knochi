import { Signal } from "@purifyjs/core";

export type SignalOrValue<T> = Signal<T> | T;
