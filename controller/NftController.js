const { default: axios } = require("axios");
require('dotenv').config();

const CACHE_TTL = 365 * 24 * 60 * 60
const cache = new NodeCache({ stdTTL: CACHE_TTL }); // TTL 1 tahun (365 hari)

const getAttributes = async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Cek cache sebelum fetch ke third-party
    const cachedData = cache.get(url);
    if (cachedData) {
        res.set({
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
            "ETag": cachedData.etag,
        });

        // Jika client punya data yang sama, balas 304 Not Modified
        if (req.headers["if-none-match"] === cachedData.etag) {
            return res.status(304).end();
        }

        return res.json(cachedData.data);
    }

    try {
        const response = await axios.get(url);
        const etag = response.headers.etag || `"${Buffer.from(url).toString("base64")}"`;

        // Simpan cache untuk 1 tahun
        cache.set(url, { data: response.data, etag });

        res.set({
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
            "ETag": etag,
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
}

module.exports = {
    getAttributes
}