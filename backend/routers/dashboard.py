from fastapi import APIRouter
from database import get_db

router = APIRouter()

@router.get("/kpis")
def get_kpis():
    conn = get_db()
    
    total_members = conn.execute("SELECT COUNT(DISTINCT profile_member_id) FROM patient_360").fetchone()[0]
    care_gaps_open = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE compliant = 'NO'").fetchone()[0]
    follow_up_pending = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE follow_up = 'N'").fetchone()[0]
    total_emails_sent = conn.execute("SELECT COUNT(*) FROM outreach_log WHERE channel = 'Email'").fetchone()[0]
    
    # Priority alert members (critical)
    priority_alerts = conn.execute("""
        SELECT profile_member_id, member_name, measure, transportation_access
        FROM patient_360 
        WHERE priority = 'CRITICAL' AND transportation_access = 'N'
    """).fetchall()
    
    alerts = [{"id": a[0], "name": a[1], "measure": a[2], "transport": a[3]} for a in priority_alerts]
    
    return {
        "total_members": total_members,
        "care_gaps_open": care_gaps_open,
        "follow_up_pending": follow_up_pending,
        "total_emails_sent": total_emails_sent,
        "priority_alerts": alerts
    }

@router.get("/charts")
def get_charts():
    conn = get_db()
    
    # Donut chart: Members by Measure
    measure_counts = conn.execute("SELECT measure, COUNT(*) FROM patient_360 GROUP BY measure").fetchall()
    members_by_measure = [{"measure": r[0], "count": r[1]} for r in measure_counts]
    
    # Bar chart: Compliance rate by measure
    compliance_stats = conn.execute("""
        SELECT measure, 
               COUNT(*) as total, 
               SUM(CASE WHEN compliant = 'YES' THEN 1 ELSE 0 END) as compliant_count
        FROM patient_360 
        GROUP BY measure
    """).fetchall()
    
    compliance_rate = [{"measure": r[0], "rate": round(r[2]/r[1]*100, 2) if r[1] > 0 else 0} for r in compliance_stats]
    
    # Language Distribution
    lang_counts = conn.execute("SELECT primary_language, COUNT(*) FROM patient_360 GROUP BY primary_language ORDER BY COUNT(*) DESC").fetchall()
    language_distribution = [{"language": r[0] if r[0] else 'Unknown', "count": r[1]} for r in lang_counts]

    # SDOH Risk Factors
    no_transport = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE transportation_access = 'N'").fetchone()[0]
    unstable_housing = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE housing_status = 'N'").fetchone()[0]
    low_income = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE income = 'Low'").fetchone()[0]
    far_provider = conn.execute("SELECT COUNT(*) FROM patient_360 WHERE provider_access = 'More Than 10 Miles'").fetchone()[0]

    sdoh_factors = [
        {"factor": "No Transport", "count": no_transport},
        {"factor": "Unstable Housing", "count": unstable_housing},
        {"factor": "Low Income", "count": low_income},
        {"factor": "Far Provider (>10mi)", "count": far_provider},
    ]

    # Simulated monthly care gap closure trend
    outreach_effectiveness = [
        {"month": "Jan", "value": 20},
        {"month": "Feb", "value": 35},
        {"month": "Mar", "value": 45},
        {"month": "Apr", "value": 75},
        {"month": "May", "value": 90},
    ]

    return {
        "members_by_measure": members_by_measure,
        "compliance_rate": compliance_rate,
        "language_distribution": language_distribution,
        "sdoh_factors": sdoh_factors,
        "outreach_effectiveness": outreach_effectiveness
    }
