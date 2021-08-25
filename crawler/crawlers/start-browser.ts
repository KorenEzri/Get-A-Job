import puppeteer from "puppeteer";
import Logger from "../logger/logger";
// const args = [
//   "--no-sandbox",
//   "--disable-setuid-sandbox",
//   "--disable-infobars",
//   "--window-position=0,0",
//   "--ignore-certifcate-errors",
//   "--ignore-certifcate-errors-spki-list",
//   '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
// ];
export const startBrowser = async (): Promise<
  puppeteer.Browser | undefined
> => {
  try {
    Logger.info("Opening browser..");
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      ignoreHTTPSErrors: true,
    });
    return browser;
  } catch ({ message }) {
    Logger.error(`Could not create browser instance: ${message}`);
  }
};
