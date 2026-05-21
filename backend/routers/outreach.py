from fastapi import APIRouter, HTTPException
from database import get_db
from models.schemas import EmailGenerateRequest, EmailSendRequest, SmsSendRequest, BulkOutreachRequest
from services.ai_service import generate_email_content, generate_sms_content
from services.email_service import send_real_email

router = APIRouter()

@router.post("/generate-email")
def generate_email(req: EmailGenerateRequest):
    conn = get_db()
    result = conn.execute("SELECT * FROM patient_360 WHERE id_normalized = ?", [req.member_id]).df()
    if result.empty:
        raise HTTPException(status_code=404, detail="Member not found")
        
    result = result.where(result.notnull(), None)
    member_data = result.to_dict(orient="records")[0]
    
    email_content = generate_email_content(member_data)
    
    return {"content": email_content, "language": member_data.get("primary_language", "English")}

@router.post("/send-email")
def send_email(req: EmailSendRequest):
    conn = get_db()
    
    # Fetch real email address
    res = conn.execute("SELECT email, member_name, profile_member_id FROM patient_360 WHERE id_normalized = ? LIMIT 1", [req.member_id]).fetchone()
    if res and res[0]:
        subject = f"Important Update Regarding Your Care - {res[1]}"
        send_real_email(res[0], subject, req.content)
        
    profile_id = res[2] if res else f"M{str(req.member_id).zfill(3)}"
        
    # Log to outreach_log
    conn.execute("""
        INSERT INTO outreach_log (member_id, channel, language, content, status)
        VALUES (?, 'Email', ?, ?, 'Sent')
    """, [profile_id, req.language, req.content])
    
    return {"status": "success", "message": "Email sent successfully"}

@router.post("/send-sms")
def send_sms(req: SmsSendRequest):
    conn = get_db()
    res = conn.execute("SELECT profile_member_id FROM patient_360 WHERE id_normalized = ? LIMIT 1", [req.member_id]).fetchone()
    profile_id = res[0] if res else f"M{str(req.member_id).zfill(3)}"
    
    conn.execute("""
        INSERT INTO outreach_log (member_id, channel, language, content, status)
        VALUES (?, 'SMS', ?, ?, 'Sent')
    """, [profile_id, req.language, req.content])
    
    return {"status": "success", "message": "SMS sent successfully"}

@router.get("/log")
def get_outreach_log():
    conn = get_db()
    logs = conn.execute("SELECT * FROM outreach_log ORDER BY created_at DESC").df()
    logs = logs.where(logs.notnull(), None)
    return logs.to_dict(orient="records")

@router.delete("/log/clear")
def clear_outreach_log():
    conn = get_db()
    conn.execute("DELETE FROM outreach_log")
    return {"status": "success", "message": "Log cleared"}

@router.post("/bulk")
def bulk_outreach(req: BulkOutreachRequest):
    conn = get_db()
    results = []
    
    for mid in req.member_ids:
        # Generate email
        res = conn.execute("SELECT * FROM patient_360 WHERE id_normalized = ?", [mid]).df()
        if res.empty:
            continue
        member_data = res.to_dict(orient="records")[0]
        
        email_content = generate_email_content(member_data)
        
        # Send real email
        if member_data.get("email"):
            subject = f"Important Update Regarding Your Care - {member_data.get('member_name')}"
            send_real_email(member_data.get("email"), subject, email_content)
        
        profile_id = member_data.get("profile_member_id", f"M{str(mid).zfill(3)}")
        
        # Log email
        conn.execute("""
            INSERT INTO outreach_log (member_id, channel, language, content, status)
            VALUES (?, 'Email', ?, ?, 'Sent')
        """, [profile_id, member_data.get("primary_language", "English"), email_content])
        
        # If transportation is N, auto-send SMS too
        if member_data.get("transportation_access") == 'N':
            sms_content = generate_sms_content(member_data)
            conn.execute("""
                INSERT INTO outreach_log (member_id, channel, language, content, status)
                VALUES (?, 'SMS', ?, ?, 'Sent')
            """, [profile_id, member_data.get("primary_language", "English"), sms_content])
            
        results.append(mid)
        
    return {"status": "success", "processed_ids": results}
