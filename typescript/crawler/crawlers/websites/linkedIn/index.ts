import { addConnections } from "./linkedin-connections";
import {
  linkedInConnectionsLoginLink,
  loginToLinkedIn,
  linkedInJobsLink,
  checkForSecurityCheck,
  initStealthLinkedInCraweler,
} from "./linkedin-utils";
import { initializeCrawler, sleep, withTryCatch } from "../../scrape-utils";
import { collectJobApplicationLinks } from "./linkedin-jobs";

export const linkedIn = {
  addConnections: async (count: number) => {
    const { page } = await withTryCatch(
      initStealthLinkedInCraweler,
      [linkedInConnectionsLoginLink],
      true
    );
    await loginToLinkedIn(page);
    const isCaptcha = await checkForSecurityCheck(page);
    if (isCaptcha) {
      sleep(16000);
    }
    const res = await addConnections(page, count);
    if (res === "OK") {
      await sleep(Math.floor(Math.random() * 3122 * 200) + 1321);
      await linkedIn.addConnections(Math.floor(Math.random() * 22) + 1);
    }
  },
  collectJobApplicationLinks: async () => {
    const { page } = await withTryCatch(
      initializeCrawler,
      [linkedInJobsLink],
      true
    );
    if (!page) return;
    await collectJobApplicationLinks(page);
  },
  // sendJobApplications: async (count: number) => {
  //   const { page } = await withTryCatch(
  //     initLinkedInCrawler,
  //     [linkedInJobsLink],
  //     true
  //   );
  //   if (!page) return;
  // },
};
