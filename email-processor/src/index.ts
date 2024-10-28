import { container, TOKENS } from './di-container-builder';

async function start() {
    console.log(`Getting gmailProvider`);
    const gmailProvider = container.get(TOKENS.gmailProvider);

    console.log(`Getting emailProcessorService`);
    const processorService = container.get(TOKENS.emailProcessorService);

    const res = await gmailProvider.getEmails();
    processorService.processEmail(res.emailIds[0], gmailProvider)
}

start().then(() => console.log("Email Processor Started."));
