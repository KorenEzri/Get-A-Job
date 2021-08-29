import {
  glassdoor,
  jobmaster,
  linkedIn,
  generalWeb,
} from "./crawlers/websites";
import Logger from "./logger/logger";
const getRandomNumber = (maxValue: number) => {
  return Math.floor(Math.random() * maxValue) + 1;
};

// linkedIn.addConnections(getRandomNumber(22));
// linkedIn.collectJobApplicationLinks(getRandomNumber(22));
jobmaster();
// generalWeb.applyToJobsFromLinkList();
