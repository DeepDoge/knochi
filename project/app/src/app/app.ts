import "~/app/feed/database/client.ts";

import { fragment, tags } from "@purifyjs/core";
import { feedGroupFormDialog } from "~/app/feed/feedGroupFormDialog.ts";
import { Layout } from "~/app/layout/Layout.ts";
import { manifest } from "~/app/manifest.ts";
import { progressListElement } from "~/domains/progress/mod.ts";
import { connectWallet } from "~/domains/wallet/mod.ts";

const { link } = tags;

document.head.append(
	fragment(
		link()
			.rel("manifest")
			.href(`data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`),
		/* html`
			<style>
				:root {
					filter: url(#deuteranopia);
				}
			</style>
			<svg>
				<filter id="deuteranopia">
					<feColorMatrix
						values="0.367  0.861 -0.228  0.000  0.000
									 0.280  0.673  0.047  0.000  0.000
									-0.012  0.043  0.969  0.000  0.000
									 0.000  0.000  0.000  1.000  0.000"></feColorMatrix>
				</filter>
			</svg>
		`, */
	),
);

document.body.append(
	fragment(Layout(), feedGroupFormDialog, connectWallet.dialog, progressListElement),
);
