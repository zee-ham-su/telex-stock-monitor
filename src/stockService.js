require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const TELEX_WEBHOOK_URL = process.env.TELEX_WEBHOOK_URL;
const SYMBOLS = process.env.STOCK_SYMBOLS || "AAPL,MSFT,GOOGL";

if (!API_KEY) {
    throw new Error("API key is missing. Set ALPHA_VANTAGE_API_KEY in your .env file.");
}
if (!TELEX_WEBHOOK_URL) {
    throw new Error("Telex Webhook URL is missing. Set TELEX_WEBHOOK_URL in your .env file.");
}

async function fetchStockPrices(symbols) {
    const symbolList = symbols.split(',');
    const results = [];

    for (const symbol of symbolList) {
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
            );
            const data = response.data['Global Quote'];
            results.push({
                symbol: data['01. symbol'],
                price: data['05. price'],
                change: data['09. change'],
                lastTradeTime: data['07. latest trading day'],
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
        const price = parseFloat(stock.price).toFixed(2);
        const changePercent = parseFloat(stock.changePercent.replace('%', '')).toFixed(2) + '%';
        
        const trend = stock.changePercent.startsWith('-') ? '🔴' : '🟢';
        message += `${trend} **${stock.symbol}**: $${price} (${changePercent})\n`;
    });
    return message;
}

async function sendToTelex() {
    const stocks = await fetchStockPrices(SYMBOLS);
    if (stocks.length === 0) {
        console.log("No stock data to send.");
        return;
    }

    const payload = {
        event_name: "Stock Update",
        message: formatMessage(stocks),
        status: "success",
        username: "stock-bot"
    };

    try {
        const response = await axios.post(TELEX_WEBHOOK_URL, payload, {
            headers: { "Content-Type": "application/json" }
        });
        console.log("✅ Sent to Telex:", response.data);
    } catch (error) {
        console.error("❌ Failed to send to Telex:", error.response?.data || error.message);
    }
}

module.exports = { fetchStockPrices, formatMessage, sendToTelex };
