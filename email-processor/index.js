const emailProvider = require('./email-providers/gmail-provider');
const emailProcessorService = require('./services/email-processor-service');
const fs = require('fs').promises;
const path = require('path');

const secondsSinceEpoch = (date) => Math.floor(date.getTime() / 1000);
const CONFIGURATION_PATH = path.join(process.cwd(), 'configuration-files', 'main-config.json');
const EMAIL_PROCESSED_PATH = path.join(process.cwd(), 'configuration-files', 'email-processed.json');

/**
 * Get json data.
 */
async function getJsonData(path) {
    console.log(`Getting json - ${path}`);
    try {
        const content = await fs.readFile(path);
        const config = JSON.parse(content);
        return config;
    } catch (err) {
        console.log(`err - ${err}`);
    }
}

async function start() {
    const promises = await Promise.allSettled(
        [getJsonData(CONFIGURATION_PATH),
        getJsonData(EMAIL_PROCESSED_PATH)]);

    const res = await emailProvider.getEmails(promises[0].value);
    emailProcessorService.processEmail(res.data.messages[0].id, emailProvider)
}

start().then(() => console.log("Email Processor Started."));
