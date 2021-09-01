import { initializeCrawler, sleep, withTryCatch } from "../../scrape-utils";
import jobLinks from "../../../saved-data/linkedIn/joblinks.json";
import { fillApplicationForm } from "./general-utils";

export const generalWeb = {
  applyToJobsFromLinkList: async () => {
    const { page } = await withTryCatch(initializeCrawler, [undefined], true);
    if (!page) return;
    for (let i = 0; i < jobLinks.length; i++) {
      const jobLink = jobLinks[i];
      await page.goto(jobLink, { waitUntil: "networkidle2" });
      await fillApplicationForm(page);
    }
  },
};
