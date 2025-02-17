const axios = require('axios');

async function fetchStockPrices(apiKey, symbols) {
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