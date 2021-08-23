import puppeteer from 'puppeteer'
import * as login from "./loginToWebsite";
import * as openPost from "./openPostTab";
import * as sendApplication from "./sendApplication"
import args from "../../args.json";


export const glassdoor = async (page: puppeteer.Page) => {
 await login.getGlassdoorLoginFromJobsearchLink(page);
  await login.loginToWebsite(args.websiteName, page);
}