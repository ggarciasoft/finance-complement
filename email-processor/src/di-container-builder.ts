import { Container, token, injected } from 'brandi';
import { GmailProvider } from './services/email-providers/gmail-provider';
import { EmailProcessorService } from './services/email-processor-service';
import { ConfigData } from './models/config-data';
import { getConfigurationData } from './utils'
import { GmailExtracter } from './services/email-extracter/gmail-extracter';
import { BHDParser } from './services/email-parser/bhd-parser';
import { EmailParserFactory } from './services/email-parser/email-parser-factory';
import { FinanceComplementService } from './services/finance-complement-service';

const TOKENS = {
  gmailProvider: token<GmailProvider>('gmailProvider'),
  configData: token<ConfigData>('configData'),
  emailProcessorService: token<EmailProcessorService>('emailProcessorService'),
  gmailExtracter: token<GmailExtracter>('gmailExtracter'),
  emailParserFactory: token<EmailParserFactory>('emailParserFactory'),
  bhdParser: token<BHDParser>('bhdParser'),
  financeComplementService: token<FinanceComplementService>('financeComplementService'),
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

container
  .bind(TOKENS.financeComplementService)
  .toInstance(FinanceComplementService)
  .inSingletonScope();

injected(GmailProvider, TOKENS.configData, TOKENS.gmailExtracter);
injected(EmailProcessorService, TOKENS.emailParserFactory, TOKENS.financeComplementService);
injected(EmailParserFactory, TOKENS.configData, TOKENS.bhdParser);
injected(FinanceComplementService, TOKENS.configData);
injected(BHDParser, TOKENS.configData);

export {
  TOKENS,
  container,
};