const express = require('express');
const { fetchStockPrices, formatMessage, sendToTelex } = require('./stockService');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/fetch-stocks', async (req, res) => {
    const { symbols } = req.body;
    if (!symbols) {
        return res.status(400).json({ error: 'Symbols are required' });
    }

    try {
        const stocks = await fetchStockPrices(symbols);
        const message = formatMessage(stocks);
        res.json({ content: message });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});

// Auto-send stock updates to Telex every hour
setInterval(sendToTelex, 3600 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    sendToTelex(); // Send stock update at startup
});
