const { FinanceComplementService } = require('../services/toshl-finance-complement-service');
const { Transaction, TransactionType } = require('../models/transaction');
const { Account, ConfigData } = require('../models/config-data');

// Mock fetch
global.fetch = jest.fn();

describe('FinanceComplementService', () => {
  let financeComplementService;
  let mockConfigData;
  let mockLogger;
  let mockResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      addIdentation: jest.fn(),
      removeIdentation: jest.fn()
    };

    // Mock config data
    mockConfigData = {
      toshlUrl: 'https://api.toshl.com/entries',
      toshlToken: 'test-token',
      defaultCurrency: 'USD',
      exchangeRate: [
        { currency: 'DOP', rate: 58.5 },
        { currency: 'USD', rate: 1 }
      ]
    };

    // Mock fetch response
    mockResponse = {
      ok: true,
      status: 201,
      statusText: 'Created',
      json: jest.fn().mockResolvedValue({ id: 'test-entry-id' })
    };
    global.fetch.mockResolvedValue(mockResponse);

    // Create the service with mocks
    financeComplementService = new FinanceComplementService(mockConfigData, mockLogger);
  });

  test('should save transaction successfully', async () => {
    // Arrange
    const account = {
      toshlAccountId: 'toshl-account-1',
      currency: 'DOP'
    };
    
    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date('2023-02-01');
    transaction.note = 'Test transaction';
    transaction.category = 'Groceries';
    transaction.tags = ['food', 'supermarket'];
    transaction.accountFrom = account;
    transaction.transactionType = TransactionType.PayWithCard;

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      mockConfigData.toshlUrl,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      })
    );
    
    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(requestBody).toEqual({
      amount: 100,
      account: 'toshl-account-1',
      currency: {
        code: 'DOP',
        rate: 58.5,
        fixed: false
      },
      date: '2023-02-01',
      desc: 'Test transaction',
      category: 'Groceries',
      tags: ['food', 'supermarket']
    });
    
    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.addIdentation).toHaveBeenCalled();
    expect(mockLogger.removeIdentation).toHaveBeenCalled();
  });

  test('should handle transfer between accounts', async () => {
    // Arrange
    const accountFrom = {
      toshlAccountId: 'toshl-account-1',
      currency: 'DOP'
    };
    
    const accountTo = {
      toshlAccountId: 'toshl-account-2',
      currency: 'USD'
    };
    
    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date('2023-02-01');
    transaction.note = 'Transfer between accounts';
    transaction.accountFrom = accountFrom;
    transaction.accountTo = accountTo;
    transaction.transactionType = TransactionType.TransferBetweenAccount;

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(requestBody.transaction).toEqual({
      account: 'toshl-account-2',
      currency: {
        code: 'USD',
        rate: 1,
        fixed: false
      }
    });
  });

  test('should handle missing amount or account', async () => {
    // Arrange
    const transaction = new Transaction();
    transaction.date = new Date('2023-02-01');
    transaction.note = 'Invalid transaction';
    // Missing amount and account

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should handle API error response', async () => {
    // Arrange
    const account = {
      toshlAccountId: 'toshl-account-1',
      currency: 'DOP'
    };
    
    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date('2023-02-01');
    transaction.accountFrom = account;
    
    // Mock error response
    mockResponse.ok = false;
    mockResponse.status = 400;
    mockResponse.statusText = 'Bad Request';
    global.fetch.mockResolvedValue(mockResponse);

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    expect(global.fetch).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to create Toshl entry: 400 Bad Request',
      'FinanceComplementService/saveTransaction'
    );
  });

  test('should use default currency when account currency is missing', async () => {
    // Arrange
    const account = {
      toshlAccountId: 'toshl-account-1'
      // No currency specified
    };
    
    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date('2023-02-01');
    transaction.accountFrom = account;

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(requestBody.currency.code).toBe('USD'); // Default currency
  });

  test('should use default exchange rate when currency rate is not found', async () => {
    // Arrange
    const account = {
      toshlAccountId: 'toshl-account-1',
      currency: 'EUR' // Not in the exchange rate list
    };
    
    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date('2023-02-01');
    transaction.accountFrom = account;

    // Act
    await financeComplementService.saveTransaction(transaction);

    // Assert
    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(requestBody.currency.rate).toBe(1); // Default rate
  });
});
