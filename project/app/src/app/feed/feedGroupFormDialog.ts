import { tags } from "@purifyjs/core";
import { FeedGroupForm } from "~/features/feed/components/FeedGroupForm";
import { useClickClose } from "~/lib/effects/useClickClose";
import { useCloseOnDisconnect } from "~/lib/effects/useCloseOnDisconnect";
import { Router } from "~/lib/router/mod";

const { dialog } = tags;

export const feedGroupFormDialogSearchParam = new Router.SearchParam<"create" | `update:${string}`>(
	"group-form",
);

export const feedGroupFormDialog = dialog()
	.effect((element) => {
		return feedGroupFormDialogSearchParam.follow((value) => {
			if (value) {
				element.showModal();
			} else {
				element.close();
			}
		}, true);
	})
	.effect(useCloseOnDisconnect())
	.effect(useClickClose())
	.onclose((event) => {
		event.preventDefault();
		feedGroupFormDialogSearchParam.val = null;
	})
	.children(
		feedGroupFormDialogSearchParam
			.derive((value) =>
				value?.startsWith("update:") ? value.slice("update:".length) : null,
			)
			.derive((id) =>
				FeedGroupForm({
					id,
					onDone() {
						feedGroupFormDialogSearchParam.val = null;
					},
				}),
			),
	);
