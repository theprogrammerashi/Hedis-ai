from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import dashboard, members, outreach

app = FastAPI(title="HEDIS Outreach Dashboard API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for POC
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Initialize DuckDB and load Excel data
    init_db()
    print("Database initialized successfully.")

# Include Routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(members.router, prefix="/api/members", tags=["Members"])
app.include_router(outreach.router, prefix="/api/outreach", tags=["Outreach"])

@app.get("/")
def read_root():
    return {"status": "API is running"}
