const getEmails = require('./email-providers/gmail-provider');
const fs = require('fs').promises;
const path = require('path');

const secondsSinceEpoch = (date) => Math.floor(date.getTime() / 1000);

/**
 * Get config data.
 *
 * @return {Promise<ConfigData|null>}
 */
async function getConfigData() {
    const CONFIGURATION_PATH = path.join(process.cwd(), '..', 'email-processor', 'configuration-files', 'main-config.json');
    console.log(`config path - ${CONFIGURATION_PATH}`);
    try {
        const content = await fs.readFile(CONFIGURATION_PATH);
        const config = JSON.parse(content);
        return config;
    } catch (err) {
        console.log(`err - ${err}`);
    }
}

async function start() {
    const configData = await getConfigData();

    const res = await getEmails(configData);

    console.table(res);
}

start().then(() => console.log("Email Processor Started."));
