import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import Logger from "../../logger/logger";

export const startBrowser = async (): Promise<
  puppeteer.Browser | undefined
> => {
  try {
    Logger.info("Opening browser..");
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 25,
      ignoreHTTPSErrors: true,
    });
    return browser;
  } catch ({ message }) {
    Logger.error(`Could not create browser instance: ${message}`);
  }
};

export const initializeCrawler = async (address?: string) => {
  const userAgent = new UserAgent();
  const browser = await startBrowser();
  if (!browser) return;
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setViewport({
    width: 1200,
    height: 1000,
  });
  page.setDefaultTimeout(10000);
  if (!page) {
    Logger.error("Error occured, aborting..");
  }
  if (address) {
    Logger.info(`Navigating to link, url: ${address};`);
    await page.goto(address, {
      waitUntil: "networkidle2",
    });
  }
  return { page, browser };
};
