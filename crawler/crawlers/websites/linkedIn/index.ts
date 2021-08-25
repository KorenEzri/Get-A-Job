import Logger from "../../../logger/logger";
import { addConnections } from "./linkedin-connections";
import {
  linkedInConnectionsLoginLink,
  loginToLinkedIn,
  linkedInJobsLoginLink,
  initLinkedInCrawler,
  checkForSecurityCheck,
  initStealthLinkedInCraweler,
} from "./linkedin-utils";
import { sleep, withTryCatch } from "../../utils";

export const linkedIn = {
  addConnections: async (count: number) => {
    const { page, browser } = await withTryCatch(
      initStealthLinkedInCraweler,
      [linkedInConnectionsLoginLink],
      true
    );
    if (!page) return;
    await loginToLinkedIn(page);
    const isCaptcha = await checkForSecurityCheck(page);
    if (isCaptcha) {
      await page.close();
      await browser.close();
    }
    const res = await addConnections(page, count);
    if (res === "OK") {
      await sleep(Math.floor(Math.random() * 3122 * 200) + 1321);
      await linkedIn.addConnections(Math.floor(Math.random() * 22) + 1);
    }
  },
  sendJobApplications: async (count: number) => {
    const page = await withTryCatch(
      initLinkedInCrawler,
      [linkedInJobsLoginLink],
      true
    );
    if (!page) return;
    await loginToLinkedIn(page);
  },
};
