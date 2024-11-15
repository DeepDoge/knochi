import { sha256, toUtf8Bytes } from "ethers";
import jazzicon from "jazzicon-ts";
import { feedDB } from "~/features/feed/database/client";
import { RssSvg } from "~/shared/svgs/RssSvg";
import { html } from "~/shared/utils/html";

export function FeedGroupIconSvg(
	group: ReturnType<(typeof feedDB.lastVersion.models.FeedGroup)["parser"]>,
) {
	if (group.groupId === "~") {
		return RssSvg();
	}

	const iconWrapper = jazzicon(64, parseInt(sha256(toUtf8Bytes(group.groupId)).slice(2, 10), 16));
	const svg = iconWrapper.firstElementChild as SVGSVGElement;
	svg.setAttribute("viewBox", `0 0 64 64`);
	svg.setAttribute("width", "100%");
	svg.style.backgroundColor = `color-mix(in srgb, ${iconWrapper.style.backgroundColor}, #000 25%)`;
	svg.style.borderRadius = "50%";

	const letterSize = 64 * 0.75;

	svg.append(
		html`
			<svg>
				<text
					x="32"
					y="32"
					style="font-family:monospace;font-size:${String(letterSize)}px"
					fill="#fff"
					text-anchor="middle"
					dominant-baseline="central"
					central>
					${group.name.at(0)?.toLocaleUpperCase() ?? "?"}
				</text>
			</svg>
		`.querySelector("text")!,
		html`
			<style>
				@scope {
					rect {
						opacity: 0.4;
					}
				}
			</style>
		`,
	);

	return svg;
}
