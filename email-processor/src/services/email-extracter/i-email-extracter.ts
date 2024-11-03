import { EmailDetail } from "../../models/email-detail";

export interface IEmailExtracter {
    getEmailBody(emailDetail: EmailDetail): string | null;
}