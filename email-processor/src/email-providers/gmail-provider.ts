
import { promises as fs } from 'fs';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google, gmail_v1 } from 'googleapis';
import { ConfigData } from '../models/config-data';
import { EmailList } from '../models/email-list';
import { EmailDetail } from '../models/email-detail';
import { IEmailProvider } from "../services/i-email-provider";

export class GmailProvider implements IEmailProvider {
    SCOPES: string[];
    mailClient: gmail_v1.Gmail | undefined;
    currentWorkDirectory: string;
    TOKEN_PATH: string;
    CREDENTIALS_PATH: string;
    constructor() {
        this.SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
        this.currentWorkDirectory = process.cwd();
        this.TOKEN_PATH = path.join(this.currentWorkDirectory, 'src', 'configuration-files', 'credentials', 'gmail-token.json');
        this.CREDENTIALS_PATH = path.join(this.currentWorkDirectory, 'src', 'configuration-files', 'credentials', 'gmail-credentials.json');

        this.authorize().then(async auth => {
            this.mailClient = google.gmail({ version: 'v1', auth });
        });
    }

    /**
     * Reads previously authorized credentials from the save file.
     */
    async loadSavedCredentialsIfExist(): Promise<any> {
        try {
            const content = await fs.readFile(this.TOKEN_PATH);
            const credentials = content.toJSON();
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    /**
     * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    async saveCredentials(client: any): Promise<void> {
        const content = await fs.readFile(this.CREDENTIALS_PATH);
        const keys = JSON.parse(content.toString());
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(this.TOKEN_PATH, payload);
    }

    /**
     * Load or request or authorization to call APIs.
     *
     */
    async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: this.SCOPES,
            keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await this.saveCredentials(client);
        }
        return client;
    }

    async getEmails(configData: ConfigData): Promise<EmailList> {
        if (!this.mailClient) {
            return { emailIds: [] };
        }
        const res = await this.mailClient.users.messages.list({
            userId: 'me',
            q: `label:recibos-pagos-facturas after:${configData.fromDate}`
        });

        const emailList = new EmailList();
        if (res.data.messages) {
            emailList.emailIds = res.data.messages.map(message => message.id || '');
        }
        return emailList;
    }

    async getEmailDetail(emailId: string): Promise<EmailDetail> {
        if (!this.mailClient) {
            return { from: '', payload: undefined };
        }
        const res = await this.mailClient.users.messages.get({
            userId: 'me',
            id: emailId
        });

        const emailDetail = new EmailDetail();
        if (res.data.payload) {
            emailDetail.from = res.data.payload.headers?.find(o => o.name === "from")?.value || '';
            emailDetail.payload = res.data.payload || {};
        }
        return emailDetail;
    }

};