const { GmailExtracter } = require('../services/email-extracter/gmail-extracter');
const { EmailDetail } = require('../models/email-detail');

// Mock Buffer globally
global.Buffer = {
  from: jest.fn()
};

describe('GmailExtracter', () => {
  let gmailExtracter;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up Buffer.from mock for each test
    Buffer.from.mockImplementation((str) => ({
      toString: jest.fn().mockImplementation(() => {
        // Map specific base64 strings to their decoded values
        if (str === 'PGh0bWw+VGVzdCBIVE1MIGNvbnRlbnQ8L2h0bWw+') {
          return '<html>Test HTML content</html>';
        }
        if (str === 'VGVzdCBwbGFpbiB0ZXh0') {
          return 'Test plain text';
        }
        if (str === 'PGh0bWw+TmVzdGVkIEhUTUwgY29udGVudDwvaHRtbD4=') {
          return '<html>Nested HTML content</html>';
        }
        if (str === 'RGlyZWN0IGJvZHkgY29udGVudA==') {
          return 'Direct body content';
        }
        return '';
      })
    }));

    // Mock the logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      addIdentation: jest.fn(),
      removeIdentation: jest.fn()
    };

    // Create the extracter with mocks
    gmailExtracter = new GmailExtracter(mockLogger);
    
    // Mock the getBodyFromParts method
    gmailExtracter.getBodyFromParts = jest.fn();
  });

  test('should extract email body from HTML part', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    const htmlContent = 'PGh0bWw+VGVzdCBIVE1MIGNvbnRlbnQ8L2h0bWw+';
    
    emailDetail.payload = {
      parts: [
        { mimeType: 'text/plain', body: { data: 'VGVzdCBwbGFpbiB0ZXh0' } },
        { mimeType: 'text/html', body: { data: htmlContent } }
      ]
    };
    
    gmailExtracter.getBodyFromParts.mockReturnValue(htmlContent);

    // Act
    const result = gmailExtracter.getEmailBody(emailDetail);

    // Assert
    expect(result).toBe('<html>Test HTML content</html>');
    expect(Buffer.from).toHaveBeenCalledWith(htmlContent, 'base64');
    expect(mockLogger.addIdentation).toHaveBeenCalled();
    expect(mockLogger.removeIdentation).toHaveBeenCalled();
  });

  test('should extract email body directly from payload if no parts', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    const bodyContent = 'RGlyZWN0IGJvZHkgY29udGVudA==';
    
    emailDetail.payload = {
      body: { data: bodyContent }
    };

    // Act
    const result = gmailExtracter.getEmailBody(emailDetail);

    // Assert
    expect(result).toBe('Direct body content');
    expect(Buffer.from).toHaveBeenCalledWith(bodyContent, 'base64');
  });

  test('should return null if payload is missing', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.payload = undefined;

    // Act
    const result = gmailExtracter.getEmailBody(emailDetail);

    // Assert
    expect(result).toBeNull();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should return empty string if no body data found', () => {
    // Arrange
    const emailDetail = new EmailDetail();
    emailDetail.payload = {
      parts: [
        { mimeType: 'text/plain', body: {} }  // No data
      ]
    };
    
    gmailExtracter.getBodyFromParts.mockReturnValue('');

    // Act
    const result = gmailExtracter.getEmailBody(emailDetail);

    // Assert
    expect(result).toBe('');
  });
});
