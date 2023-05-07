import { createWeakCacheMap } from "./weak-cache"

export namespace JXL {
	export type Config = {
		decoderScriptUrl: string
	}

	const caches = createWeakCacheMap<HTMLCanvasElement>()

	const ongoing: Record<string, Promise<HTMLCanvasElement>> = {}
	export async function decode(jxlSrc: string, config: Config) {
		const cache = caches.getCache(jxlSrc)
		if (cache) return cache

		return await (ongoing[jxlSrc] ??= new Promise(async (resolve) => {
			const image = await (await fetch(jxlSrc)).arrayBuffer()
			const worker = new Worker(config.decoderScriptUrl)
			worker.postMessage({ jxlSrc, image })
			worker.addEventListener("message", (message: MessageEvent<{ imgData?: ImageData }>) => {
				if (!message.data.imgData) return

				const imgData = message.data.imgData

				const canvas = document.createElement("canvas")
				canvas.width = imgData.width
				canvas.height = imgData.height
				const context = canvas.getContext("2d")
				context?.putImageData(imgData, 0, 0)

				caches.setCache(jxlSrc, canvas)

				resolve(canvas)
			})
		}))
	}
}
