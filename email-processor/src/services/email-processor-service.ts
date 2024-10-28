import { ConfigData } from "../models/config-data";
import { IEmailProvider } from "./email-providers/i-email-provider";
export interface IEmailProcessorService {
    processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void>;
}

export class EmailProcessorService implements IEmailProcessorService {
    configData: ConfigData;

    constructor(configData: ConfigData) {
        this.configData = configData;
    }

    async processEmail(emailId: string, emailProvider: IEmailProvider): Promise<void> {
        const emailDetailRes = await emailProvider.getEmailDetail(emailId);
        const emailParser = emailProvider.getEmailParser();
        const transaction = await emailParser.getTransaction(emailDetailRes);
    }
}