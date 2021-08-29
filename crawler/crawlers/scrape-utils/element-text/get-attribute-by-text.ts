import puppeteer from "puppeteer";
export const getElementJSHandleAttrByTxt = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page,
  property?: string
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  property = property || "href";
  return await element?.getProperty(property);
};
export const getElementHandleByTxt = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  return element;
};
