import { literal, object, string, union, unknown } from "zod";

export type CallRequestMessageData = (typeof CallRequestMessageData)["_type"];
export const CallRequestMessageData = object({
	type: literal("call:request"),
	name: string(),
	args: unknown().array(),
});

export type CallResponseMessageData = (typeof CallResponseMessageData)["_type"];
export const CallResponseMessageData = union([
	object({ type: literal("success"), result: unknown() }),
	object({ type: literal("error"), error: string() }),
]);
