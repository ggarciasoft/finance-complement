import { promises as fs } from 'fs';
import { join } from 'path';
import { GmailProvider } from './email-providers/gmail-provider.ts';
import { EmailProcessorService } from './services/email-processor-service.ts';
import { ConfigData } from './models/config-data.ts';

const secondsSinceEpoch = (date) => Math.floor(date.getTime() / 1000);
const CONFIGURATION_PATH = join(process.cwd(), 'configuration-files', 'main-config.json');
const EMAIL_PROCESSED_PATH = join(process.cwd(), 'configuration-files', 'email-processed.json');

/**
 * Get json data.
 */
async function getJsonData(path: string): Promise<string> {
    console.log(`Getting json - ${path}`);
    try {
        const content = await fs.readFile(path);
        return content.toString();
    } catch (err) {
        console.log(`err - ${err}`);
    }
    return '';
}

function getConfigurationData(json: string): ConfigData {
    try {
        const config = JSON.parse(json.toString());
        return config;
    } catch (err) {
        console.log(`err - ${err}`);
    }
    return { fromDate: secondsSinceEpoch(new Date()).toString() }
}

async function start() {
    const gmailProvider = new GmailProvider();
    const processorService = new EmailProcessorService();
    const configData = await getJsonData(CONFIGURATION_PATH);
    const emailProcessedData = await getJsonData(EMAIL_PROCESSED_PATH);

    const res = await gmailProvider.getEmails(getConfigurationData(configData));
    processorService.processEmail(res.emailIds[0], gmailProvider)
}

start().then(() => console.log("Email Processor Started."));
