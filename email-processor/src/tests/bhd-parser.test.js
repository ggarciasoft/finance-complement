// Mock the Transaction class and TransactionType enum before importing
const mockTransaction = {
  amount: 0,
  date: new Date(),
  note: '',
  category: '',
  tags: [],
  accountFrom: null,
  accountTo: null,
  transactionType: null
};

// Mock the Transaction constructor
jest.mock('../models/transaction', () => {
  return {
    Transaction: jest.fn().mockImplementation(() => {
      return { ...mockTransaction };
    }),
    TransactionType: {
      PayWithCard: 'PayWithCard',
      TransferBetweenAccount: 'TransferBetweenAccount',
      PayWithAccount: 'PayWithAccount',
      Deposit: 'Deposit',
      None: 'None'
    }
  };
});

// Mock JSDOM
jest.mock('jsdom', () => ({
  JSDOM: jest.fn()
}));

// Now import the modules
const { BHDParser } = require('../services/email-parser/bhd-parser');
const { TransactionType } = require('../models/transaction');

describe('BHDParser', () => {
  let bhdParser;
  let mockConfigData;
  let mockLogger;

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
      accountMapping: [
        {
          bankAccountFormats: ['1234'],
          toshlAccountId: 'toshl-account-1',
          currency: 'DOP'
        },
        {
          bankAccountFormats: ['5678'],
          toshlAccountId: 'toshl-account-2',
          currency: 'USD'
        }
      ]
    };

    // Create the parser with mocks
    bhdParser = new BHDParser(mockConfigData, mockLogger);
    
    // Mock the parser methods directly
    bhdParser.parsePayWithCard = jest.fn();
    bhdParser.parseTransferBetweenAccounts = jest.fn();
    bhdParser.parseDeposit = jest.fn();
    bhdParser.getAccount = jest.fn();
  });

  test('should parse pay with card transaction', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    const mockCardTransaction = {
      amount: 100,
      date: new Date(),
      note: 'Test transaction',
      category: 'Supermarket',
      accountFrom: mockConfigData.accountMapping[0],
      transactionType: null
    };
    
    bhdParser.parsePayWithCard.mockReturnValue(mockCardTransaction);
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.PayWithCard);

    // Assert
    expect(bhdParser.parsePayWithCard).toHaveBeenCalledWith(emailHtml);
    expect(result).toBeDefined();
    expect(result.amount).toBe(-100); // Should be negative for PayWithCard
    expect(result.transactionType).toBe(TransactionType.PayWithCard);
    expect(mockLogger.addIdentation).toHaveBeenCalled();
    expect(mockLogger.removeIdentation).toHaveBeenCalled();
  });

  test('should parse transfer between accounts transaction', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    const mockTransferTransaction = {
      amount: 200,
      date: new Date(),
      note: 'Test transfer',
      accountFrom: mockConfigData.accountMapping[0],
      accountTo: mockConfigData.accountMapping[1],
      transactionType: null
    };
    
    bhdParser.parseTransferBetweenAccounts.mockReturnValue(mockTransferTransaction);
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.TransferBetweenAccount);

    // Assert
    expect(bhdParser.parseTransferBetweenAccounts).toHaveBeenCalledWith(emailHtml);
    expect(result).toBeDefined();
    expect(result.amount).toBe(200);
    expect(result.transactionType).toBe(TransactionType.TransferBetweenAccount);
  });

  test('should parse pay with account transaction', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    const mockPayTransaction = {
      amount: 300,
      date: new Date(),
      note: 'Test payment',
      accountFrom: mockConfigData.accountMapping[0],
      accountTo: mockConfigData.accountMapping[1],
      transactionType: null
    };
    
    bhdParser.parseTransferBetweenAccounts.mockReturnValue(mockPayTransaction);
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.PayWithAccount);

    // Assert
    expect(bhdParser.parseTransferBetweenAccounts).toHaveBeenCalledWith(emailHtml);
    expect(result).toBeDefined();
    expect(result.amount).toBe(-300); // Should be negative for PayWithAccount
    expect(result.transactionType).toBe(TransactionType.PayWithAccount);
  });

  test('should parse deposit transaction', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    const mockDepositTransaction = {
      amount: 400,
      date: new Date(),
      note: 'Test deposit',
      accountTo: mockConfigData.accountMapping[1],
      transactionType: null
    };
    
    bhdParser.parseDeposit.mockReturnValue(mockDepositTransaction);
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.Deposit);

    // Assert
    expect(bhdParser.parseDeposit).toHaveBeenCalledWith(emailHtml);
    expect(result).toBeDefined();
    expect(result.amount).toBe(400);
    expect(result.transactionType).toBe(TransactionType.Deposit);
  });

  test('should handle unsupported transaction type', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, 'UnsupportedType');

    // Assert
    expect(result).toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should handle parsing errors', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    bhdParser.parsePayWithCard.mockImplementation(() => {
      throw new Error('Parsing error');
    });
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.PayWithCard);

    // Assert
    expect(result).toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should handle declined card transactions', async () => {
    // Arrange
    const emailHtml = '<html>test</html>';
    bhdParser.parsePayWithCard.mockReturnValue(undefined);
    
    // Act
    const result = await bhdParser.getTransaction(emailHtml, TransactionType.PayWithCard);

    // Assert
    expect(result).toBeUndefined();
  });
});
