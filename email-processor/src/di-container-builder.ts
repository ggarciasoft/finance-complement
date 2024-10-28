import { Container, token, injected } from 'brandi';
import { GmailProvider } from './services/email-providers/gmail-provider';
import { EmailProcessorService } from './services/email-processor-service';
import { ConfigData } from './models/config-data';
import { getConfigurationData } from './utils'
import { GmailParser } from './services/email-parser/gmail-parser';

const TOKENS = {
  gmailProvider: token<GmailProvider>('gmailProvider'),
  configData: token<ConfigData>('configData'),
  emailProcessorService: token<EmailProcessorService>('emailProcessorService'),
  gmailParser: token<GmailParser>('gmailParser'),
};

const container = new Container();

container
  .bind(TOKENS.configData)
  .toConstant(getConfigurationData());

container
  .bind(TOKENS.gmailProvider)
  .toInstance(GmailProvider)
  .inTransientScope();

container
  .bind(TOKENS.emailProcessorService)
  .toInstance(EmailProcessorService)
  .inTransientScope();

container
  .bind(TOKENS.gmailParser)
  .toInstance(GmailParser)
  .inSingletonScope();


injected(GmailProvider, TOKENS.configData, TOKENS.gmailParser);
injected(EmailProcessorService, TOKENS.configData);

export {
  TOKENS,
  container,
};