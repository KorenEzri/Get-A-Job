import { glassdoor, jobmaster, linkedIn } from "./crawlers/websites";
const getRandomNumber = (maxValue: number) => {
  return Math.floor(Math.random() * maxValue) + 1;
};

// linkedIn.addConnections(getRandomNumber(22));
jobmaster();
