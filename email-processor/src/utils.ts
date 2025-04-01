import fs from 'fs';
import { join } from 'path';
import { ConfigData } from './models/config-data';

const secondsSinceEpoch = (date: Date) => Math.floor(date.getTime() / 1000);
const epochToDate = (epoch: number) => new Date(epoch * 1000);
const CONFIGURATION_PATH = join(process.cwd(), 'src', 'configuration-files', 'main-config.json');

function getConfigurationData(): ConfigData {
    try {
        const content = fs.readFileSync(CONFIGURATION_PATH);
        const config = JSON.parse(content.toString());
        return config;
    } catch (err) {
        throw (err);
    }
}

function saveConfigurationData(configData: ConfigData): void {
    try {
        JSON.stringify(configData);
        fs.writeFileSync(CONFIGURATION_PATH, JSON.stringify(configData));
    } catch (err) {
        throw (err);
    }
}

export {
    getConfigurationData,
    saveConfigurationData,
    secondsSinceEpoch,
    epochToDate
};