import { IEmailParserFactory } from "./email-parser/email-parser-factory";
import { IEmailProvider } from "./email-providers/i-email-provider";
import { IFinanceComplementService } from "./toshl-finance-complement-service";
import { Logger } from './logger';

export interface IEmailProcessorService {
  processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void>;
}

export class EmailProcessorService implements IEmailProcessorService {
  constructor(
    private readonly emailParserFactory: IEmailParserFactory,
    private readonly financeComplementService: IFinanceComplementService,
    private readonly logger: Logger
  ) {}

  async processEmail(
    emailId: string,
    emailProvider: IEmailProvider
  ): Promise<void> {
    try {
      this.logger.info(
        `Processing emailId: ${emailId}`,
        "EmailProcessorService/processEmail"
      );

      const emailDetailRes = await emailProvider.getEmailDetail(emailId);
      const emailParser = this.emailParserFactory.getEmailParser(emailDetailRes);
      if (!emailParser || !emailParser.transactionType || !emailParser.parser) {
        this.logger.error(
          `EmailParser error emailId: ${emailId}`,
          "EmailProcessorService/processEmail"
        );
        return;
      }

      const emailExtracter = emailProvider.getEmailExtracter();

      const body = emailExtracter.getEmailBody(emailDetailRes);

      if (!body) {
        this.logger.error(
          `Email body not found for emailId: ${emailId}.`,
          "EmailProcessorService/processEmail"
        );
        return;
      }

      const transaction = await emailParser.parser.getTransaction(
        body,
        emailParser.transactionType
      );
      if (transaction) {
        await this.financeComplementService.saveTransaction(transaction);
        return;
      }

      this.logger.error(
        `Transaction not found for emailId: ${emailId}.`,
        "EmailProcessorService/processEmail"
      );
    } catch (error) {
      this.logger.error(`Error processing email: ${error}`);
      throw error;
    }
  }
}
