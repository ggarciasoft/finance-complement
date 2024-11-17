import { container, TOKENS } from './di-container-builder';
import logger from './services/logger';
import { saveConfigurationData, secondsSinceEpoch } from './utils';

async function start() {
    logger.info(`Getting gmailProvider`, "index");
    const gmailProvider = container.get(TOKENS.gmailProvider);

    logger.info(`Getting emailProcessorService`, "index");
    const processorService = container.get(TOKENS.emailProcessorService);

    logger.info(`Getting emails`, "index");
    const resEmails = await gmailProvider.getEmails();

    logger.info(`Getting configData`, "index");
    const configData = container.get(TOKENS.configData);

    logger.info(`Processing emails`, "index");
    const emailToBeProcessed = resEmails.emailIds.filter(emailId => !configData.emailProcessed.includes(emailId));
    logger.info(`Email to be processed: ${emailToBeProcessed.length}`, "index");
    for (const emailId of emailToBeProcessed) {
        processorService.processEmail(emailId, gmailProvider);
    }

    logger.info(`Saving configData`, "index");
    configData.emailProcessed = [...configData.emailProcessed, ...emailToBeProcessed];
    configData.fromDate = secondsSinceEpoch(new Date()).toString();
    saveConfigurationData(configData);
}

start().then(() => logger.info("Email Processor Started.", "index"));
