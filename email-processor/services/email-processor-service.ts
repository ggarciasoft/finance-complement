import { MessagePart } from "../models/email-detail";
import { IEmailProvider } from "./i-email-provider";

export class EmailProcessorService {
    // Decode the email body
    getBody(messagePayload: MessagePart) {
        let encodedBody: string = '';
        if (messagePayload.parts) {
            encodedBody = messagePayload.parts.filter(part => part.mimeType === 'text/html' || part.mimeType === 'text/plain')[0].body?.data || '';
        } else {
            encodedBody = messagePayload.body?.data || '';
        }
        const buffer = Buffer.from(encodedBody, 'base64');
        return buffer.toString('utf-8');
    }

    async processEmail(emailId: string, emailProvider: IEmailProvider) {
        const emailDetailRes = await emailProvider.getEmailDetail(emailId);
        if (emailDetailRes.payload) {
            const body = this.getBody(emailDetailRes.payload);
            //const from = emailDetailRes.data.payload.headers["from"];
            console.log(emailDetailRes);
        }
    }
}