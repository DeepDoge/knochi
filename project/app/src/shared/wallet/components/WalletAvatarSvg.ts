import jazzicon from "jazzicon-ts";
import { Address } from "~/shared/solidity/primatives";

export function WalletAvatarSvg(address: Address) {
	const iconWrapper = jazzicon(64, parseInt(address.slice(2, 10), 16));
	const svg = iconWrapper.firstElementChild as SVGSVGElement;
	svg.setAttribute("viewBox", `0 0 64 64`);
	svg.setAttribute("width", "100%");
	svg.style.backgroundColor = iconWrapper.style.backgroundColor;
	svg.style.borderRadius = "50%";

	return svg;
}
