from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import logging
import os
import time

smtp_client = None  # Global SMTP reference
logger = logging.getLogger(__name__)
SMTP_HOST = "smtp.hostinger.com"
SMTP_PORT = 465
SMTP_TIMEOUT = 30  # 30 seconds timeout


def create_smtp_connection():
    """Create a new SMTP connection."""
    try:
        smtp = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT)
        user_name = os.getenv("SMTP_USER_NAME")
        password = os.getenv("SMTP_PASSWORD")
        if not user_name or not password:
            logger.error("SMTP credentials not found in environment variables")
            return None
        smtp.login(user_name, password)
        logger.info("✅ SMTP connection established.")
        return smtp
    except Exception as e:
        logger.error(f"Failed to create SMTP connection: {e}")
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global smtp_client
    smtp_client = create_smtp_connection()

    yield  # Everything after this line runs at shutdown

    if smtp_client:
        try:
            smtp_client.quit()
            logger.info("🔒 SMTP connection closed.")
        except Exception as e:
            logger.warning(f"Error closing SMTP connection: {e}")
        finally:
            smtp_client = None


def get_smtp():
    """Get SMTP client, recreating connection if needed."""
    global smtp_client
    
    # Check if connection exists and is still alive
    if smtp_client:
        try:
            # Try a noop command to check if connection is alive
            smtp_client.noop()
            return smtp_client
        except (smtplib.SMTPServerDisconnected, OSError, AttributeError):
            # Connection is dead, close it
            logger.warning("SMTP connection is dead, recreating...")
            try:
                smtp_client.quit()
            except:
                pass
            smtp_client = None
    
    # Recreate connection if it doesn't exist or is dead
    if not smtp_client:
        smtp_client = create_smtp_connection()
        if not smtp_client:
            raise RuntimeError("Failed to establish SMTP connection")
    
    return smtp_client


async def send_email(to: str, subject: str, text_body: str = "", html_body: str = "", max_retries: int = 3):
    """Send email with automatic retry and connection recovery."""
    sender_email = os.getenv("SMTP_USER_NAME")
    if not sender_email:
        logger.error("SMTP_USER_NAME not found in environment variables")
        return False

    # Create message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to
    message["Subject"] = subject
    if text_body:
        message.attach(MIMEText(text_body, "plain"))
    if html_body:
        message.attach(MIMEText(html_body, "html"))

    message_str = message.as_string()
    
    # Retry logic with connection recovery
    for attempt in range(max_retries + 1):
        try:
            smtp = get_smtp()
            smtp.sendmail(sender_email, to, message_str)
            logger.info(f"Email sent successfully to {to}")
            return True
        except (smtplib.SMTPSenderRefused, smtplib.SMTPRecipientsRefused, 
                smtplib.SMTPServerDisconnected, OSError, TimeoutError) as e:
            logger.warning(f"Email send attempt {attempt + 1} failed: {e}")
            
            # Force connection recreation on next attempt
            global smtp_client
            if smtp_client:
                try:
                    smtp_client.quit()
                except:
                    pass
                smtp_client = None
            
            if attempt < max_retries:
                # Wait before retry (exponential backoff)
                wait_time = (attempt + 1) * 2
                logger.info(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                logger.error(f"Failed to send email after {max_retries + 1} attempts: {e}")
                import traceback
                traceback.print_exc()
                return False
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    return False
