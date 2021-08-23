import puppeteer from "puppeteer";
import Logger from "../logger/logger";

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
