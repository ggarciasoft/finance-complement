import { ConfigData } from "../models/config-data";
import { EmailDetail } from "../models/email-detail";
import { EmailList } from "../models/email-list";

export interface IEmailProvider {
    getEmails(configData: ConfigData): Promise<EmailList>;
    getEmailDetail(emailId: string): Promise<EmailDetail>;
}