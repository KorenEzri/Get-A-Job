import Logger from "../../../logger/logger";
import { startBrowser } from "../../start-browser";
import * as actions from "./glassdoor-actions";

const glassdoorLink =
  "https://www.glassdoor.com/Job/tel-aviv-fullstack-jobs-SRCH_IL.0,8_IC2421090_KE9,18.htm";

export const glassdoor = async () => {
  const browser = await startBrowser();
  if (!browser) return;
  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 1000,
  });
  Logger.info(`Navigating to glassdoor jobsearch link, url: ${glassdoorLink};`);
  await page.goto(glassdoorLink, { waitUntil: "networkidle2" });
  await actions.openGlassdoorLoginModal(page);
  await actions.loginToGlassdoor(page);
};
