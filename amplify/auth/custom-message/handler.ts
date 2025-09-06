import type { CustomMessageTriggerHandler } from "aws-lambda";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_SignUp") {
    // Check if this signup came from a referral
    const referralCode = event.request.userAttributes['custom:referralCode'] || '';
    const referrerId = event.request.userAttributes['custom:referrerId'] || '';
    
    let referralMessage = '';
    if (referralCode) {
      referralMessage = `
        <p>You signed up using a referral code: <strong>${referralCode}</strong></p>
        <p><b>You'll get 3 months of free access!</b></p>
        <p>Invite friends and get 3 additional months for each successful referral!</p>
      `;
    } else {
      referralMessage = `
        <p><b>You'll get 3 months of free access!</b></p>
        <p>Invite friends and get 3 additional months for each successful referral!</p>
      `;
    }

    event.response.emailSubject = "Welcome to Perkins! Please Verify Your Email";
    event.response.emailMessage = `
      <html>
        <body>
          <p>Hello,</p>
          <p>Thank you for signing up for Perkins!</p>
          ${referralMessage}
          <p>To verify your email address, please use the following code:</p>
          <h3>${event.request.codeParameter}</h3>
          <p>If you didn't sign up for this service, please ignore this email.</p>
          <p>Sincerely,</p>
          <p>The Perkins Team</p>
        </body>
      </html>
    `;
  }
  return event;
};