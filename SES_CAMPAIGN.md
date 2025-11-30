1. Project Goal & Architecture
Goal: Automate the phased sending of 1,320 professional invitations to the perkinsintel.com contact list, respecting a daily warm-up limit and ensuring a time delay between contacts at the same corporate domain to bypass B2B spam filters.

Architecture:
Database: DynamoDB (Perkins_Intelligence_Contact_List).
Scheduler: AWS EventBridge (runs Lambda hourly, 10 AM - 4 PM Buenos Aires time, Monday-Friday).
Sender: AWS Lambda calling AWS SES.

2. DynamoDB Data Model & Setup
The table holds all contact information and controls the sending schedule.

Company, FirstName, LastName and email are provided. Complete with additional fields that allow global warm-up control, time delay between contacts at the same corporate and status. 

Data Loading:
Excel table containing Company, FirstName, LastName and email information list.

4. Lambda Function Logic
Environment Variables:
SENDER_EMAIL	info@perkinsintel.com	Verified SES identity.
DAILY_SEND_LIMIT	50 (Start here, increase after a week)	Max emails to send globally per 24 hours.
COMPANY_SPACING_DAYS	3	Minimum days delay for contact #2, #3, etc., within the same domain.

Core Logic (lambda_handler function):
Initialization: Get today's date (YYYY-MM-DD). Initialize Boto3 clients for DynamoDB and SES.

Query DynamoDB:

Scan the table for items where:

Sent_Status is False.

Target_Send_Date is less than or equal to today's date.

Sort these results by Send_Group_ID ascending.

Apply Warm-up Limit: Take only the first DAILY_SEND_LIMIT contacts from the sorted list obtained in Step 2.

Processing Loop: Iterate through the selected contacts:

Personalization: Prepare the email content, replacing [Nombre del Contacto] with the Nombre field.

SES Send: Call ses.send_email using the structured email template.

Update Database: If SES returns success:

Update the item in DynamoDB: Set Sent_Status = True and Sent_Date = Today's Date.

Error Handling: Log any SES errors or bounces and set a specific error status in DynamoDB.