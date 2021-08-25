import puppeteer from "puppeteer";
import { selectors } from "../linkedIn-selectors";
import { clickElement, withTryCatch, fillInputField } from "../../../utils";
import {
  checkIfInviteIsBlocked,
  clickUserProfile,
  collectAllConnectButtons,
  sendConnectionInvite,
} from "../linkedin-utils";
