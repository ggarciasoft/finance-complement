import { EmailDetail } from "../../models/email-detail";
import { EmailList } from "../../models/email-list";
import { IEmailParser } from "../email-parser/i-email-parser";

export interface IEmailProvider {
    getEmails(): Promise<EmailList>;
    getEmailDetail(emailId: string): Promise<EmailDetail>;
    getEmailParser(): IEmailParser;
}