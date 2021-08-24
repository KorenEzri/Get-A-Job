import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/stream-transport";
import Logger from "../../logger/logger";
require("dotenv").config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendMail = async (options: MailOptions) => {
  try {
    await transporter.sendMail(options);
    return true;
  } catch ({ message }) {
    Logger.error(message);
    return false;
  }
};
