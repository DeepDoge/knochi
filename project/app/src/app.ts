import "~/features/post/database/client";

import { fragment, tags } from "@purifyjs/core";
import { Layout } from "~/app/Layout";
import { manifest } from "~/app/manifest";
import { progressListElement } from "~/lib/progress/utils";
import { connectWallet } from "~/lib/wallet/connectDialog";

const { link } = tags;

document.head.append(
	fragment(
		link()
			.rel("manifest")
			.href(`data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`),
	),
);

document.body.append(fragment(Layout(), connectWallet.dialog, progressListElement));
