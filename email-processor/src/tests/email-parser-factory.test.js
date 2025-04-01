const { EmailParserFactory } = require('../services/email-parser/email-parser-factory');
const { BHDParser } = require('../services/email-parser/bhd-parser');
const { Banks, ConfigData } = require('../models/config-data');
const { EmailDetail } = require('../models/email-detail');
const { TransactionType } = require('../models/transaction');
const { Logger } = require('../services/logger');

describe('EmailParserFactory', () => {
  let emailParserFactory;
  let mockConfigData;
  let mockBhdParser;
  let mockLogger;

  beforeEach(() => {
    // Mock the logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      addIdentation: jest.fn(),
      removeIdentation: jest.fn()
    };

    // Mock the BHD parser
    mockBhdParser = {
      bank: Banks.BHD,
      getTransaction: jest.fn()
    };

    // Mock config data
    mockConfigData = {
      emailBankMapping: [
        {
          emailFrom: ['test@bhd.com.do'],
          bank: Banks.BHD,
          emailTransactionType: [
            { emailTitle: 'Payment Confirmation', transactionType: TransactionType.PayWithCard },
            { emailTitle: 'Transfer Confirmation', transactionType: TransactionType.TransferBetweenAccount }
          ]
        },
        {
          emailFrom: ['another@bank.com'],
          bank: 'ANOTHER_BANK',
          emailTransactionType: [
            { emailTitle: 'Deposit Confirmation', transactionType: TransactionType.Deposit }
          ]
        }
      ]
    };

    // Create the factory with mocks
    emailParserFactory = new EmailParserFactory(mockConfigData, mockBhdParser, mockLogger);
  });

  test('should return BHD parser for BHD email', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'test@bhd.com.do';
    emailDetail.title = 'Payment Confirmation';

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeDefined();
    expect(result.parser).toBe(mockBhdParser);
    expect(result.transactionType).toBe(TransactionType.PayWithCard);
    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.addIdentation).toHaveBeenCalled();
    expect(mockLogger.removeIdentation).toHaveBeenCalled();
  });

  test('should return BHD parser with TransferBetweenAccount transaction type', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'test@bhd.com.do';
    emailDetail.title = 'Transfer Confirmation';

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeDefined();
    expect(result.parser).toBe(mockBhdParser);
    expect(result.transactionType).toBe(TransactionType.TransferBetweenAccount);
  });

  test('should return undefined when email bank mapping not found', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'unknown@example.com';
    emailDetail.title = 'Some Title';

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'EmailBankMapping not found for Email From: unknown@example.com and Title: Some Title.',
      'EmailParserFactory/getEmailParser'
    );
  });

  test('should return undefined when parser not found for bank', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'another@bank.com';
    emailDetail.title = 'Deposit Confirmation';

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeDefined();
    expect(result.parser).toBeUndefined();
    expect(result.transactionType).toBe(TransactionType.Deposit);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Email Parser not found for bank: ANOTHER_BANK.',
      'EmailParserFactory/getEmailParser'
    );
  });

  test('should default to Deposit transaction type when not specified', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'test@bhd.com.do';
    emailDetail.title = 'Unknown Title'; // Not in the mapping
    
    // Modify the mock config to include an entry without transaction type
    mockConfigData.emailBankMapping[0].emailTransactionType.push({
      emailTitle: 'Unknown Title'
      // No transactionType specified
    });

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeDefined();
    expect(result.parser).toBe(mockBhdParser);
    expect(result.transactionType).toBe(TransactionType.Deposit); // Should default to Deposit
  });

  test('should handle case sensitivity in email matching', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.from = 'TEST@bhd.com.do'; // Uppercase
    emailDetail.title = 'Payment Confirmation';

    // Act
    const result = emailParserFactory.getEmailParser(emailDetail);

    // Assert
    expect(result).toBeUndefined(); // Should not match due to case sensitivity
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
