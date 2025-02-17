const express = require('express');
const { fetchStockPrices, formatMessage } = require('./stockService');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/fetch-stocks', async (req, res) => {
  const { symbols } = req.body.settings;
  try {
    const stocks = await fetchStockPrices(symbols);
    const message = formatMessage(stocks);
    res.json({ content: message });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
