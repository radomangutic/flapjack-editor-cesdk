import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { phone, restaurantName,restaurantId } = JSON.parse(req.body);
  try {
    const messageBody = `📲 ${restaurantName} Invite 📲\nHello,\nYou've been invited to join ${restaurantName}! Click the link below to get started:\n${process.env.SITE_DOMAIN}/templates?phone=${phone}&id=${restaurantId}\nIf you didn't request this invitation, please ignore this message.\nBest regards,\n${restaurantName}`;
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILLO_PHONE,
      to: phone,
    });

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error in sending message ", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
}
