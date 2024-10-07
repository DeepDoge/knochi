export const manifest = {
	name: "My WebApp",
	short_name: "WebApp",
	description: "An awesome web app",
	start_url: new URL("/", location.href).href,
	display: "standalone",
	background_color: "#000000",
	theme_color: "#000000",
	icons: [
		{
			src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='144' viewBox='0 0 144 144'%3E%3Ccircle cx='72' cy='72' r='64' fill='%23000'%3E%3C/circle%3E%3C/svg%3E",
			type: "image/svg+xml",
			sizes: "144x144",
			purpose: "any",
		},
		{
			src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 4l12 20H12z' fill='%23ff0000'/%3E%3C/svg%3E",
			type: "image/svg+xml",
			sizes: "48x48",
			purpose: "any",
		},
	],
	screenshots: [
		{
			src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23ccc'/%3E%3Ctext x='50%' y='50%' font-size='30' text-anchor='middle' fill='%23000'%3EWide Screenshot%3C/text%3E%3C/svg%3E",
			type: "image/svg+xml",
			sizes: "800x400",
			form_factor: "wide",
		},
		{
			src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='800' viewBox='0 0 400 800'%3E%3Crect width='400' height='800' fill='%23ddd'/%3E%3Ctext x='50%' y='50%' font-size='30' text-anchor='middle' fill='%23000'%3ERegular Screenshot%3C/text%3E%3C/svg%3E",
			type: "image/svg+xml",
			sizes: "400x800",
		},
	],
};
