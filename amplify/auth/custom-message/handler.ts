import type { CustomMessageTriggerHandler } from "aws-lambda";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_SignUp") {
    event.response.emailSubject = "Welcome to Perkins! Please Verify Your Email";
    event.response.emailMessage = `
      <html>
        <body>
          <p>Hello ${event.request.usernameParameter},</p>
          <p>Thank you for signing up for Perkis News</p>
          <p>To verify your email address, please use the following code:</p>
          <h3>${event.request.codeParameter}</h3>
          <p>If you didn't sign up for this service, please ignore this email.</p>
          <p>Sincerely,</p>
          <p>The Perkins News Team</p>
        </body>
      </html>
    `;
  }
  return event;
};