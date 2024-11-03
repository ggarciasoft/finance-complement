import { EmailDetail } from "../../models/email-detail";
import { EmailList } from "../../models/email-list";
import { IEmailExtracter } from "../email-extracter/i-email-extracter";

export interface IEmailProvider {
    getEmails(): Promise<EmailList>;
    getEmailDetail(emailId: string): Promise<EmailDetail>;
    getEmailExtracter(): IEmailExtracter;
}