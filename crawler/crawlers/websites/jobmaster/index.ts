import Logger from "../../../logger/logger";
import { startBrowser } from "../../start-browser";
import * as actions from "./jobmaster-actions";
import args from "../../../args.json";

const jobmasterLoginLink =
  "https://account.jobmaster.co.il/?isMobileApp=&isIphoneApp=&isAndroidApp=&r=https%3A%2F%2Fpeople%2Ejobmaster%2Eco%2Eil%2Fcode%2Fprofile%2Dpersonal%2FMyAccountMenu%2Easp";

export const jobmaster = async () => {
  const browser = await startBrowser();
  if (!browser) return;
  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 1000,
  });
  Logger.info(
    `Navigating to Jobmaster login link, url: ${jobmasterLoginLink};`
  );
  await page.goto(jobmasterLoginLink, { waitUntil: "networkidle2" });
  await actions.loginToJobmaster(page);
  for (let i = 0; i < args.jobKeyWords.length; i++) {
    const keyword = args.jobKeyWords[i];
    for (let i = 1; i < 11; i++) {
      const pageNumber = i;
      try {
        const jobmasterJobsearchLink = `https://www.jobmaster.co.il/jobs/?currPage=${pageNumber}&q=${keyword}`;
        Logger.info(
          `Navigating to Jobmaster jobsearch link, url: ${jobmasterJobsearchLink}`
        );
        await page.goto(`${jobmasterJobsearchLink}`, {
          waitUntil: "networkidle2",
        });
        await actions.sendApplications(page);
      } catch ({ message }) {
        if (
          message ===
          "waiting for selector `div[class=misrotList]` failed: timeout 30000ms exceeded"
        ) {
          i = 13;
        }
        Logger.error(message);
      }
    }
  }
};
