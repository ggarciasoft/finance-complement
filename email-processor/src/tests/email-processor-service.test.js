const { EmailProcessorService } = require('../services/email-processor-service');
const { TransactionType } = require('../models/transaction');
const { EmailDetail } = require('../models/email-detail');
const { Transaction } = require('../models/transaction');

// Mock the dependencies
jest.mock('../services/email-parser/email-parser-factory');
jest.mock('../services/toshl-finance-complement-service');
jest.mock('../services/logger');

describe('EmailProcessorService', () => {
  let emailProcessorService;
  let mockEmailParserFactory;
  let mockFinanceComplementService;
  let mockEmailProvider;
  let mockEmailExtracter;
  let mockLogger;
  let mockEmailParser;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock the logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      addIdentation: jest.fn(),
      removeIdentation: jest.fn()
    };

    // Mock the email parser
    mockEmailParser = {
      getTransaction: jest.fn()
    };

    // Mock the email parser factory
    mockEmailParserFactory = {
      getEmailParser: jest.fn()
    };

    // Mock the finance complement service
    mockFinanceComplementService = {
      saveTransaction: jest.fn().mockResolvedValue(undefined)
    };

    // Mock the email extracter
    mockEmailExtracter = {
      getEmailBody: jest.fn()
    };

    // Mock the email provider
    mockEmailProvider = {
      getEmailDetail: jest.fn(),
      getEmailExtracter: jest.fn().mockReturnValue(mockEmailExtracter)
    };

    // Create the service with mocks
    emailProcessorService = new EmailProcessorService(
      mockEmailParserFactory,
      mockFinanceComplementService,
      mockLogger
    );
  });

  test('should process email successfully', async () => {
    // Arrange
    const emailId = 'test-email-id';
    const emailDetail = new EmailDetail();
    emailDetail.from = 'test@example.com';
    emailDetail.title = 'Test Email';

    const transaction = new Transaction();
    transaction.amount = 100;
    transaction.date = new Date();
    transaction.note = 'Test transaction';

    mockEmailProvider.getEmailDetail.mockResolvedValue(emailDetail);
    mockEmailParserFactory.getEmailParser.mockReturnValue({
      parser: mockEmailParser,
      transactionType: TransactionType.Deposit
    });
    mockEmailExtracter.getEmailBody.mockReturnValue('Test email body');
    mockEmailParser.getTransaction.mockResolvedValue(transaction);

    // Act
    await emailProcessorService.processEmail(emailId, mockEmailProvider);

    // Assert
    expect(mockEmailProvider.getEmailDetail).toHaveBeenCalledWith(emailId);
    expect(mockEmailParserFactory.getEmailParser).toHaveBeenCalledWith(emailDetail);
    expect(mockEmailProvider.getEmailExtracter).toHaveBeenCalled();
    expect(mockEmailExtracter.getEmailBody).toHaveBeenCalledWith(emailDetail);
    expect(mockEmailParser.getTransaction).toHaveBeenCalledWith(
      'Test email body',
      TransactionType.Deposit
    );
    expect(mockFinanceComplementService.saveTransaction).toHaveBeenCalledWith(transaction);
    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.addIdentation).toHaveBeenCalled();
    expect(mockLogger.removeIdentation).toHaveBeenCalled();
  });

  test('should handle case when email parser is not found', async () => {
    // Arrange
    const emailId = 'test-email-id';
    const emailDetail = new EmailDetail();
    
    mockEmailProvider.getEmailDetail.mockResolvedValue(emailDetail);
    mockEmailParserFactory.getEmailParser.mockReturnValue(undefined);

    // Act
    await emailProcessorService.processEmail(emailId, mockEmailProvider);

    // Assert
    expect(mockEmailProvider.getEmailDetail).toHaveBeenCalledWith(emailId);
    expect(mockEmailParserFactory.getEmailParser).toHaveBeenCalledWith(emailDetail);
    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockFinanceComplementService.saveTransaction).not.toHaveBeenCalled();
  });

  test('should handle case when email body is not found', async () => {
    // Arrange
    const emailId = 'test-email-id';
    const emailDetail = new EmailDetail();
    
    mockEmailProvider.getEmailDetail.mockResolvedValue(emailDetail);
    mockEmailParserFactory.getEmailParser.mockReturnValue({
      parser: mockEmailParser,
      transactionType: TransactionType.Deposit
    });
    mockEmailExtracter.getEmailBody.mockReturnValue(null);

    // Act
    await emailProcessorService.processEmail(emailId, mockEmailProvider);

    // Assert
    expect(mockEmailExtracter.getEmailBody).toHaveBeenCalledWith(emailDetail);
    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockEmailParser.getTransaction).not.toHaveBeenCalled();
    expect(mockFinanceComplementService.saveTransaction).not.toHaveBeenCalled();
  });

  test('should handle case when transaction is not found', async () => {
    // Arrange
    const emailId = 'test-email-id';
    const emailDetail = new EmailDetail();
    
    mockEmailProvider.getEmailDetail.mockResolvedValue(emailDetail);
    mockEmailParserFactory.getEmailParser.mockReturnValue({
      parser: mockEmailParser,
      transactionType: TransactionType.Deposit
    });
    mockEmailExtracter.getEmailBody.mockReturnValue('Test email body');
    mockEmailParser.getTransaction.mockResolvedValue(undefined);

    // Act
    await emailProcessorService.processEmail(emailId, mockEmailProvider);

    // Assert
    expect(mockEmailParser.getTransaction).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockFinanceComplementService.saveTransaction).not.toHaveBeenCalled();
  });

  test('should handle exceptions during processing', async () => {
    // Arrange
    const emailId = 'test-email-id';
    const error = new Error('Test error');
    
    mockEmailProvider.getEmailDetail.mockRejectedValue(error);

    // Act & Assert
    await expect(emailProcessorService.processEmail(emailId, mockEmailProvider))
      .rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
