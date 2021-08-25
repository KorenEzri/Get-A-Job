import { addConnections } from "./linkedin-connections";
import {
  linkedInConnectionsLoginLink,
  loginToLinkedIn,
  initLinkedInCrawler,
  linkedInJobsLink,
  checkForSecurityCheck,
  initStealthLinkedInCraweler,
} from "./linkedin-utils";
import { sleep, withTryCatch } from "../../utils";
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
  sendJobApplications: async (count: number) => {
    const { page } = await withTryCatch(
      initLinkedInCrawler,
      [linkedInJobsLink],
      true
    );
    if (!page) return;
    // await loginToLinkedIn(page);
  },
  collectJobApplicationLinks: async (count: number) => {
    const { page } = await withTryCatch(
      initLinkedInCrawler,
      [linkedInJobsLink],
      true
    );
    if (!page) return;
    await collectJobApplicationLinks(page);
  },
};
