import { tags } from "@purifyjs/core";
import { FeedGroupForm } from "~/features/post/components/FeedGroupForm";
import { clickClose } from "~/lib/actions/clickClose";
import { closeOnDisconnect } from "~/lib/actions/closeOnDisconnect";
import { Router } from "~/lib/router/mod";

const { dialog } = tags;

export const feedGroupFormDialogSearchParam = new Router.SearchParam<"create" | `update:${string}`>(
	"group-form",
);

export const feedGroupFormDialog = dialog()
	.use((element) => {
		return feedGroupFormDialogSearchParam.follow((value) => {
			if (value) {
				element.showModal();
			} else {
				element.close();
			}
		}, true);
	})
	.use(closeOnDisconnect())
	.use(clickClose())
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
