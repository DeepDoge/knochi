import "~/features/post/database/client";

import { fragment, tags } from "@purifyjs/core";
import { Layout } from "~/app/Layout";
import { manifest } from "~/app/manifest";
import { FeedGroupForm } from "~/features/post/components/FeedGroupForm";
import { clickClose } from "~/lib/actions/clickClose";
import { closeOnDisconnect } from "~/lib/actions/closeOnDisconnect";
import { progressListElement } from "~/lib/progress/utils";
import { Router } from "~/lib/router/mod";
import { connectWallet } from "~/lib/wallet/connectDialog";

const { link, dialog } = tags;

document.head.append(
	fragment(
		link()
			.rel("manifest")
			.href(`data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`),
	),
);

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

document.body.append(
	fragment(Layout(), feedGroupFormDialog, connectWallet.dialog, progressListElement),
);
