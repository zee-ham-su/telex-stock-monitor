const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { fetchStockPrices } = require('../src/stockService');

const mock = new MockAdapter(axios);

describe('fetchStockPrices', () => {
  afterEach(() => {
    mock.reset();
  });

  it('fetches and parses stock data correctly', async () => {
    const mockApiResponse = {
      'Global Quote': {
        '01. symbol': 'AAPL',
        '05. price': '150.00',
        '09. change': '+1.50',
        '10. change percent': '+1.00%'
      }
    };

    // Mock the Alpha Vantage API endpoint
    mock.onGet(/alphavantage.co/).reply(200, mockApiResponse);

    const stocks = await fetchStockPrices('fake-api-key', 'AAPL');
    expect(stocks).toEqual([
      {
        symbol: 'AAPL',
        price: '150.00',
        change: '+1.50',
        changePercent: '+1.00%'
      }
    ]);
  });

  it('handles API errors gracefully', async () => {
    mock.onGet(/alphavantage.co/).reply(500, 'API Error');
    const stocks = await fetchStockPrices('fake-api-key', 'INVALID');
    expect(stocks).toEqual([]);
  });
});