import puppeteer, { ElementHandle, JSHandle } from "puppeteer";
import { generalWebSelectors } from "../../generalweb-selectors";
import {
  getElementJSHandleAttrByTxt,
  appendToJsonArray,
  sleep,
  getElementHandleByTxt,
} from "../../../../scrape-utils";
import Logger from "../../../../../logger/logger";
const possibleAttributes = ["id", "name", "value", "placeholder"];
const possibleElements = ["input", "label", "textarea"];

type InputElementsObjectKeys = Record<string, ElementHandle | undefined>;
type UserDataObjectKeys = Record<string, string>;

interface InputElements extends InputElementsObjectKeys {
  firstNameElement: ElementHandle | undefined;
  lastNameElement: ElementHandle | undefined;
  emailElement: ElementHandle | undefined;
  phoneElement: ElementHandle | undefined;
  githubElement: ElementHandle | undefined;
  linkedInElement: ElementHandle | undefined;
  resumeElement: ElementHandle | undefined;
}
interface UserData extends UserDataObjectKeys {
  firstNameElement: string;
  lastNameElement: string;
  emailElement: string;
  phoneElement: string;
  githubElement: string;
  linkedInElement: string;
  resumeElement: string;
}

const user_data: UserData = {
  firstNameElement: "Koren",
  lastNameElement: "Ben Ezri",
  emailElement: "korenatdevelopes@gmail.com",
  phoneElement: "+972543000830",
  githubElement: "https://github.com/KorenEzri",
  linkedInElement: "https://www.linkedin.com/in/korenezri/",
  resumeElement:
    "crawlers/websites/general-web/general-utils/link-list-utils/Koren Ben Ezri  Resume.pdf",
};

const assignElements = async (page: puppeteer.Page, selectors: string[]) => {
  for (let i = 0; i < possibleElements.length; i++) {
    const element = possibleElements[i];
    const firstNameElement = await getElementHandle(page, selectors, element);
    if (firstNameElement) {
      return firstNameElement;
    }
  }
};

export const fillApplicationForm = async (page: puppeteer.Page) => {
  const { textSelectors } = generalWebSelectors;
  const {
    names: { firstNameSelectors, lastNameSelectors },
  } = textSelectors;

  const inputElements: InputElements = {
    firstNameElement: await assignElements(page, firstNameSelectors),
    lastNameElement: await assignElements(page, lastNameSelectors),
    emailElement: await assignElements(page, textSelectors.emailSelectors),
    phoneElement: await assignElements(page, textSelectors.phoneSelectors),
    githubElement: await assignElements(page, textSelectors.githubSelectors),
    linkedInElement: await assignElements(
      page,
      textSelectors.linkedInSelectors
    ),
    resumeElement: await assignElements(page, textSelectors.resumeSelectors),
  } as const;

  for (const element in inputElements) {
    if (Object.prototype.hasOwnProperty.call(inputElements, element)) {
      const inputElement = inputElements[element];
      if (inputElement) {
        await inputElement.click();
        await sleep(2000);
        console.log(user_data[element]);
        await inputElement.type(user_data[element]);
      }
    }
  }
  await sleep(33000);
};

const findSelector = async (
  page: puppeteer.Page,
  selectorList: string[],
  elementType: string
) => {
  await sleep(3000);
  let JSHandle: JSHandle<unknown> | undefined;
  let inputSelector: string = "";
  for (let i = 0; i < selectorList.length; i++) {
    await sleep(3000);
    const selector = selectorList[i];
    Logger.http("The selector is: " + selector);
    for (let j = 0; j < possibleAttributes.length; j++) {
      await sleep(3000);
      const attribute = possibleAttributes[j];
      Logger.http("The attribute is: " + attribute);
      JSHandle = await getElementJSHandleAttrByTxt(
        elementType,
        selector,
        page,
        attribute
      );
      const attributeValue = JSHandle?._remoteObject.value;
      if (attributeValue) {
        const isFound = page.waitForSelector(attributeValue, { timeout: 6000 });
        console.log("ISFOUND: ", isFound);
        if (isFound !== null) {
          inputSelector = attributeValue;
        }
      }
    }
  }
  return inputSelector;
};
const getElementHandle = async (
  page: puppeteer.Page,
  selectorList: string[],
  elementType: string
) => {
  let ElementHandle: ElementHandle | undefined;
  let inputSelector: string = "";
  for (let i = 0; i < selectorList.length; i++) {
    const selector = selectorList[i];
    Logger.http("The selector is: " + selector);
    for (let j = 0; j < possibleAttributes.length; j++) {
      const attribute = possibleAttributes[j];
      Logger.http("The attribute is: " + attribute);
      ElementHandle = await getElementHandleByTxt(elementType, selector, page);
      if (ElementHandle) {
        Logger.info("FOUND!");
        return ElementHandle;
      }
    }
  }
};
