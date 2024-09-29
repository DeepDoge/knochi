import { literal, object, string, union, unknown } from "zod";

export type ExposedRequestMessageData = (typeof ExposedRequestMessageData)["_type"];
export const ExposedRequestMessageData = object({
	type: literal("exposed:request"),
	module: string(),
	name: string(),
	args: unknown().array(),
});

export type ExposedResponseMessageData = (typeof ExposedResponseMessageData)["_type"];
export const ExposedResponseMessageData = union([
	object({
		type: literal("success"),
		response: union([object({ type: literal("data"), data: unknown() }), object({ type: literal("channel") })]),
	}),
	object({ type: literal("error"), error: string() }),
]);
