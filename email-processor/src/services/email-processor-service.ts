import { IEmailParserFactory } from "./email-parser/email-parser-factory";
import { IEmailProvider } from "./email-providers/i-email-provider";
import { IFinanceComplementService } from "./finance-complement-service";
export interface IEmailProcessorService {
    processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void>;
}

export class EmailProcessorService implements IEmailProcessorService {
    constructor(private emailParserFactory: IEmailParserFactory, private financeComplementService: IFinanceComplementService) {
    }

    async processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void> {
        const emailDetailRes = await emailProvider.getEmailDetail(emailId);
        const emailParser = this.emailParserFactory.getEmailParser(emailDetailRes);
        if (!emailParser || !emailParser.transactionType || !emailParser.parser) {
            return;
        }

        const emailExtracter = emailProvider.getEmailExtracter();

        const body = emailExtracter.getEmailBody(emailDetailRes);

        if (!body) {
            return;
        }

        const transaction = await emailParser.parser.getTransaction(body, emailParser.transactionType);
        if (transaction) {
            await this.financeComplementService.saveTransaction(transaction);
        }
    }
}