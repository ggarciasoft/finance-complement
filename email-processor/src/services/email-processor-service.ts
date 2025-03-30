import { IEmailParserFactory } from "./email-parser/email-parser-factory";
import { IEmailProvider } from "./email-providers/i-email-provider";
import { IFinanceComplementService } from "./toshl-finance-complement-service";
import logger from "./logger";
export interface IEmailProcessorService {
  processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void>;
}

export class EmailProcessorService implements IEmailProcessorService {
  constructor(
    private emailParserFactory: IEmailParserFactory,
    private financeComplementService: IFinanceComplementService
  ) {}

  async processEmail(
    emailId: string,
    emailProvider: IEmailProvider
  ): Promise<void> {
    logger.addIdentation();
    logger.info(
      `Processing emailId: ${emailId}`,
      "EmailProcessorService/processEmail"
    );

    const emailDetailRes = await emailProvider.getEmailDetail(emailId);
    const emailParser = this.emailParserFactory.getEmailParser(emailDetailRes);
    if (!emailParser || !emailParser.transactionType || !emailParser.parser) {
      logger.error(
        `EmailParser error emailId: ${emailId}`,
        "EmailProcessorService/processEmail"
      );
      logger.removeIdentation();
      return;
    }

    const emailExtracter = emailProvider.getEmailExtracter();

    const body = emailExtracter.getEmailBody(emailDetailRes);

    if (!body) {
      logger.error(
        `Email body not found for emailId: ${emailId}.`,
        "EmailProcessorService/processEmail"
      );
      logger.removeIdentation();
      return;
    }

    const transaction = await emailParser.parser.getTransaction(
      body,
      emailParser.transactionType
    );
    if (transaction) {
      await this.financeComplementService.saveTransaction(transaction);
      logger.removeIdentation();
      return;
    }

    logger.error(
      `Transaction not found for emailId: ${emailId}.`,
      "EmailProcessorService/processEmail"
    );
    logger.removeIdentation();
  }
}
