import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { selectors } from "./glassdoor-selectors";
import * as utils from "../../scrape-utils";
dotenv.config();

const userPassword = process.env.USER_PASSWORD || "";
const userEmail = process.env.USER_EMAIL || "";

export const openGlassdoorLoginModal = async (page: puppeteer.Page) => {
  await utils.clickElement(selectors.signInLinkFromJobsearchPageSelector, page);
  await utils.sleep(500);
};
export const loginToGlassdoor = async (page: puppeteer.Page) => {
  await utils.fillInputField(selectors.usernameSelector, userEmail, page);
  await utils.fillInputField(selectors.passwordSelector, userPassword, page);
  await page.keyboard.press("Enter");
  await utils.sleep(600);
};
