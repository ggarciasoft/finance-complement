import { Container, token, injected, Token } from 'brandi';
import { GmailProvider } from './services/email-providers/gmail-provider';
import { EmailProcessorService } from './services/email-processor-service';
import { ConfigData } from './models/config-data';
import { getConfigurationData } from './utils'
import { GmailExtracter } from './services/email-extracter/gmail-extracter';
import { BHDParser } from './services/email-parser/bhd-parser';
import { EmailParserFactory } from './services/email-parser/email-parser-factory';
import { IEmailParser } from './services/email-parser/i-email-parser';

const TOKENS = {
  gmailProvider: token<GmailProvider>('gmailProvider'),
  configData: token<ConfigData>('configData'),
  emailProcessorService: token<EmailProcessorService>('emailProcessorService'),
  gmailExtracter: token<GmailExtracter>('gmailExtracter'),
  emailParserFactory: token<EmailParserFactory>('emailParserFactory'),
  bhdParser: token<IEmailParser>('bhdParser'),
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
  .inSingletonScope();

container
  .bind(TOKENS.gmailExtracter)
  .toInstance(GmailExtracter)
  .inSingletonScope();

  container
    .bind(TOKENS.emailParserFactory)
    .toInstance(EmailParserFactory)
    .inSingletonScope();

container
  .bind(TOKENS.bhdParser)
  .toInstance(BHDParser)
  .inSingletonScope();

injected(GmailProvider, TOKENS.configData, TOKENS.gmailExtracter);
injected(EmailProcessorService, TOKENS.emailParserFactory);
injected(EmailParserFactory, TOKENS.configData, TOKENS.bhdParser);

export {
  TOKENS,
  container,
};