import fs from "fs";
import { promisify } from "util";
const write = promisify(fs.writeFile);
interface Job {
  jobTitle: string;
  sentAt: Date | string;
  description: string;
}
const convertToCSV = (array: Job[]) => {
  const newArray = [Object.keys(array[0]) as string[] | Job[]].concat(array);
  return newArray
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
};

export const writeToCSV = async (array: any[]) => {
  const csvFormat = convertToCSV(array);
  await write("./jobs.csv", csvFormat);
};
