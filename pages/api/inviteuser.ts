import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
import { decryptData, encryptData } from "../../helpers/enryption";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { phone, restaurantName, restaurantId, isUserExist } = JSON.parse(
    req.body
  );
  const data = {
    phone,
    restaurantId,
  };
  const encryptedData = encryptData(data);
  try {
    const messageForNewUser = `You've been invited to edit menus on Flapjack for ${restaurantName}. Please create an account with this link: \n${process.env.SITE_DOMAIN}/templates?key=${encryptedData} to join your team!`;
    const messageForExistingUser = `You've been invited to edit menus on Flapjack for ${restaurantName}. Please open this link and join your team: \n${process.env.SITE_DOMAIN}/templates?key=${encryptedData}`;
    const message = await client.messages.create({
      body: isUserExist ? messageForExistingUser : messageForNewUser,
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
