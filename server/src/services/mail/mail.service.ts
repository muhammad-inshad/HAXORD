import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderMail = async (
  userEmail: string,
  userName: string,
  orderId: string
) => {
  try {
    const { data, error } = await resend.emails.send({
     from: "onboarding@resend.dev",
      to: "minshad430@gmail.com",
      subject: "Order Placed Successfully",
      html: `
        <h2>Hello ${userName}</h2>
        <p>Your order has been placed successfully.</p>
        <p>Order ID: ${orderId}</p>
      `,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return;
    }

    console.log("Email sent successfully, ID:", data?.id);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};