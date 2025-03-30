import fs from 'fs';
import { join } from 'path';
import { ConfigData } from './models/config-data';
import logger from './services/logger';

const secondsSinceEpoch = (date: Date) => Math.floor(date.getTime() / 1000);
const epochToDate = (epoch: number) => new Date(epoch * 1000);
const CONFIGURATION_PATH = join(process.cwd(), 'src', 'configuration-files', 'main-config.json');

function getConfigurationData(): ConfigData {
    logger.info(`Getting json - ${CONFIGURATION_PATH}`, "utils-get-configuration-data");
    try {
        const content = fs.readFileSync(CONFIGURATION_PATH);
        const config = JSON.parse(content.toString());
        return config;
    } catch (err) {
        logger.error(`cannot get configuration - ${err}`, "utils-get-configuration-data");
        throw (err);
    }
}

function saveConfigurationData(configData: ConfigData): void {
    logger.info(`Saving configuration - ${CONFIGURATION_PATH}`, "utils-save-configuration-data");
    try {
        JSON.stringify(configData);
        fs.writeFileSync(CONFIGURATION_PATH, JSON.stringify(configData));
    } catch (err) {
        logger.error(`cannot save configuration - ${err}`, "utils-save-configuration-data");
        throw (err);
    }
}

export {
    getConfigurationData,
    saveConfigurationData,
    secondsSinceEpoch,
    epochToDate
};