import puppeteer from "puppeteer";
import Logger from "../logger/logger";
import * as actions from "./actions";
import args from "../args.json";

const startBrowser = async (): Promise<puppeteer.Browser | undefined> => {
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

export const getWebsite = async (websiteURL: string) => {
  const browserInstance = await startBrowser();
  if (!browserInstance) return;
  const page = await browserInstance.newPage();
  await page.setViewport({
    width: 2500,
    height: 1080,
  });
  Logger.info(`Navigating to ${websiteURL}`);
  await page.goto(websiteURL, { waitUntil: "networkidle2" });
  await actions.loginToWebsite(args.websiteName, page);
  await actions.enterJobSearch(args.websiteName, args.jobKeyWords, page);
  await page.close();
  await browserInstance.close();
  Logger.info("Page and browser closed.");
};
