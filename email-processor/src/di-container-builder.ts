import { Container, token, injected } from "brandi";
import { GmailProvider } from "./services/email-providers/gmail-provider";
import { EmailProcessorService } from "./services/email-processor-service";
import { ConfigData } from "./models/config-data";
import { getConfigurationData } from "./utils";
import { GmailExtracter } from "./services/email-extracter/gmail-extracter";
import { BHDParser } from "./services/email-parser/bhd-parser";
import { EmailParserFactory } from "./services/email-parser/email-parser-factory";
import { FinanceComplementService } from "./services/toshl-finance-complement-service";
import { Logger } from "./services/logger";

const TOKENS = {
  gmailProvider: token<GmailProvider>("gmailProvider"),
  configData: token<ConfigData>("configData"),
  emailProcessorService: token<EmailProcessorService>("emailProcessorService"),
  gmailExtracter: token<GmailExtracter>("gmailExtracter"),
  emailParserFactory: token<EmailParserFactory>("emailParserFactory"),
  bhdParser: token<BHDParser>("bhdParser"),
  financeComplementService: token<FinanceComplementService>(
    "financeComplementService"
  ),
  logger: token<Logger>("logger"),
};

const container = new Container();

container.bind(TOKENS.logger).toInstance(Logger).inSingletonScope();

container.bind(TOKENS.configData).toConstant(getConfigurationData());

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

container.bind(TOKENS.bhdParser).toInstance(BHDParser).inSingletonScope();

container
  .bind(TOKENS.financeComplementService)
  .toInstance(FinanceComplementService)
  .inSingletonScope();

container
  .bind(TOKENS.emailProcessorService)
  .toInstance(EmailProcessorService)
  .inSingletonScope();

injected(GmailProvider, TOKENS.configData, TOKENS.gmailExtracter, TOKENS.logger);
injected(GmailExtracter, TOKENS.logger);
injected(
  EmailProcessorService,
  TOKENS.emailParserFactory,
  TOKENS.financeComplementService,
  TOKENS.logger
);
injected(EmailParserFactory, TOKENS.configData, TOKENS.bhdParser, TOKENS.logger);
injected(FinanceComplementService, TOKENS.configData, TOKENS.logger);
injected(BHDParser, TOKENS.configData, TOKENS.logger);

export { TOKENS, container };
