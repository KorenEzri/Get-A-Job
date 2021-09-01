import puppeteer from "puppeteer";
import { sleep } from ".";
export const fillInputField = async (
  selector: string,
  value: string,
  page: puppeteer.Page
) => {
  await page.waitForSelector(selector);
  await page.click(selector);
  await sleep(500);
  await page.type(selector, value);
};
