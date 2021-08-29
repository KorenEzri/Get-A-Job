import puppeteer from "puppeteer";

export const clickElement = async (selector: string, page: puppeteer.Page) => {
  await page.waitForSelector(selector);
  await page.click(selector);
};
