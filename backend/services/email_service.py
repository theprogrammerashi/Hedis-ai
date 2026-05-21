import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)  # Use verified sender address

logger = logging.getLogger(__name__)

def send_real_email(to_email: str, subject: str, content: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[EMAIL] SKIPPED - No SMTP credentials. Set SMTP_USER and SMTP_PASSWORD in .env")
        return False
        
    print(f"[EMAIL] Attempting to send email to: {to_email}")
    print(f"[EMAIL] Using SMTP: {SMTP_SERVER}:{SMTP_PORT} | User: {SMTP_USER} | From: {SMTP_FROM}")
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(content, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[EMAIL] SUCCESS - Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] FAILED - Error sending to {to_email}: {str(e)}")
        return False
