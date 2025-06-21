const CACHE_PREFIX = 'onnx-model-cache';
const CACHE_NAME = `${CACHE_PREFIX}-v2`;

async function fetchModelChunks(chunkUrls: string[]) {
	await clearOldCaches();

	let hasCache = false;
	const cache = await caches.open(CACHE_NAME);
	const cachedResponses = await Promise.all(chunkUrls.map((url: string) => cache.match(url)));

	// add cache
	const fetchPromises = chunkUrls.map((url: string, index: number) => {
		if (!cachedResponses[index]) {
			// console.log(`Fetching and caching: ${url}`);
			return fetch(url).then((response) => {
				if (response.ok) {
					cache.put(url, response.clone());
					return response.arrayBuffer();
				} else {
					throw new Error(`Failed to fetch ${url}`);
				}
			});
		} else {
			hasCache = true;
			// console.log(`Using cached version: ${url}`);
			return cachedResponses[index]!.arrayBuffer();
		}
	});

	const modelBuffers = await Promise.all(fetchPromises);
	return { hasCache, modelBuffers };
}

export async function fetchAndMergeChunks(urls: string[]) {
	const { hasCache, modelBuffers: chunks } = await fetchModelChunks(urls);
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
	const mergedArray = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		mergedArray.set(new Uint8Array(chunk), offset);
		offset += chunk.byteLength;
	}
	return { hasCache, model: mergedArray };
}

async function clearOldCaches() {
	const keys = await caches.keys();
	const oldCaches = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
	await Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));
}
