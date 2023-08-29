import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { phone } = JSON.parse(req.body);
  try {
    console.log(accountSid, authToken);
    
    const message = await client.messages.create({
      body: "This is the ship that made the Kessel Run in fourteen parsecs?",
      from: "+18559315319", // Replace with your Twilio phone number
      to: phone, // Replace with recipient's phone number
    });

    console.log(message.sid);
    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error in sending message ", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
}
