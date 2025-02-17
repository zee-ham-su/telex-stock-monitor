const express = require('express');
const { fetchStockPrices, formatMessage } = require('./stockService');
const app = express();
app.use(express.json());

app.post('/fetch-stocks', async (req, res) => {
  const { settings } = req.body;
  try {
    const stocks = await fetchStockPrices(settings.api_key, settings.symbols);
    const message = formatMessage(stocks);
    res.json({ content: message });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));