require('dotenv').config();
const axios = require('axios');

async function fetchStockPrices(symbols) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Set ALPHA_VANTAGE_API_KEY in your .env file.");
  }

  const symbolList = symbols.split(',');
  const results = [];

  for (const symbol of symbolList) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = response.data['Global Quote'];
      results.push({
        symbol: data['01. symbol'],
        price: data['05. price'],
        change: data['09. change'],
        lastTradeTime: data['08. latest trading day'],
        volume: data['06. volume'],
        open: data['02. open'],
        high: data['03. high'],
        low: data['04. low'],
        previousClose: data['08. previous close'],
        changePercent: data['10. change percent']
      });
    } catch (error) {
      console.error(`Failed to fetch ${symbol}: ${error.message}`);
    }
  }

  return results;
}

function formatMessage(stocks) {
  let message = "📈 **Stock Update**\n\n";
  stocks.forEach((stock) => {
    // Trim to 2 decimal places
    const price = parseFloat(stock.price).toFixed(2);
    const changePercent = parseFloat(stock.changePercent.replace('%', '')).toFixed(2) + '%';
    
    const trend = stock.changePercent.startsWith('-') ? '🔴' : '🟢';
    message += `${trend} **${stock.symbol}**: $${price} (${changePercent})\n`;
  });
  return message;
}

module.exports = { fetchStockPrices, formatMessage };