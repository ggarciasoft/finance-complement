import { EmailDetail, MessagePart } from "../../models/email-detail";
import { IEmailExtracter } from "./i-email-extracter";

export class GmailExtracter implements IEmailExtracter {
    // Decode the email body
    private getBody(messagePayload: MessagePart): string {
        let encodedBody: string = '';
        if (messagePayload.parts) {
            encodedBody = messagePayload.parts.filter(part => part.mimeType === 'text/html' || part.mimeType === 'text/plain')[0].body?.data || '';
        } else {
            encodedBody = messagePayload.body?.data || '';
        }
        const buffer = Buffer.from(encodedBody, 'base64');
        return buffer.toString('utf-8');
    }

    getEmailBody(emailDetail: EmailDetail): string | null {
        if (emailDetail.payload) {
            return this.getBody(emailDetail.payload);
        }
        console.error(`emailDetail.payload is null or undefined.`);
        return null;
    }
}