import { container, TOKENS } from './di-container-builder';
import { saveConfigurationData } from './utils';

async function start() {
    const logger = container.get(TOKENS.logger);
    logger.info("Email Processor Started.", "index");

    logger.info(`Getting mailProvider`, "index");
    const mailProvider = container.get(TOKENS.gmailProvider);

    logger.info(`Getting emailProcessorService`, "index");
    const emailProcessorService = container.get(TOKENS.emailProcessorService);

    logger.info(`Getting emails`, "index");
    const resEmails = await mailProvider.getEmails();

    logger.info(`Getting configData`, "index");
    const configData = container.get(TOKENS.configData);

    logger.info(`Processing emails`, "index");
    const emailToBeProcessed = resEmails.emailIds.filter(emailId => !configData.emailProcessed.includes(emailId));
    logger.info(`Email to be processed: ${emailToBeProcessed.length}`, "index");
    for (const emailId of emailToBeProcessed) {
        try {
            logger.createMainContext(emailId);
            await emailProcessorService.processEmail(emailId, mailProvider);
        } catch (error) {
            logger.error(`Error processing email: ${emailId}. Exception: ${error}`, "index");
        }
    }

    logger.info(`Saving configData`, "index");
    configData.emailProcessed = [...configData.emailProcessed, ...emailToBeProcessed];
    configData.fromDate = new Date();
    saveConfigurationData(configData);
}

start().then(() => {});
