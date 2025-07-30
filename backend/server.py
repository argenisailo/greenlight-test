from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import os
import uuid
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Enterprise Client Management API", version="1.0.0")

# CORS configuration
origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/client_management")
client = AsyncIOMotorClient(MONGO_URL)
db = client.client_management

# Security
security = HTTPBearer()

# Mock authentication (replace with real Microsoft Entra ID)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Mock authentication - replace with real Microsoft Entra ID validation
    if credentials.credentials == "mock-token":
        return {"sub": "mock-user", "email": "user@company.com", "name": "Mock User"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )

# Pydantic Models
class PersonData(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None

class CompanyData(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None

class QuickBooksData(BaseModel):
    customer_id: Optional[str] = None
    billing_address: Optional[str] = None
    payment_terms: Optional[str] = None
    tax_id: Optional[str] = None
    credit_limit: Optional[float] = None
    account_balance: Optional[float] = None

class DocumentsData(BaseModel):
    sharepoint_folder_url: Optional[str] = None
    document_categories: List[str] = []
    access_permissions: List[str] = []

class CredentialsData(BaseModel):
    login_portals: List[Dict[str, str]] = []
    api_keys: List[Dict[str, str]] = []
    certificates: List[Dict[str, str]] = []

class Note(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = []

class TrackingEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_type: str  # call, email, meeting, etc.
    description: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    outcome: Optional[str] = None

class OwnershipData(BaseModel):
    primary_owner: str
    secondary_owners: List[str] = []
    department: Optional[str] = None
    account_manager: Optional[str] = None
    relationship_type: Optional[str] = None

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "person" or "company"
    data: Dict[str, Any]
    quickbooks: QuickBooksData = Field(default_factory=QuickBooksData)
    documents: DocumentsData = Field(default_factory=DocumentsData)
    credentials: CredentialsData = Field(default_factory=CredentialsData)
    notes: List[Note] = []
    tracking: List[TrackingEntry] = []
    ownership: OwnershipData
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ClientCreate(BaseModel):
    type: str
    data: Dict[str, Any]
    ownership: OwnershipData

class ClientUpdate(BaseModel):
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    quickbooks: Optional[QuickBooksData] = None
    documents: Optional[DocumentsData] = None
    credentials: Optional[CredentialsData] = None
    ownership: Optional[OwnershipData] = None

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/api/clients", response_model=List[Client])
async def get_clients(
    search: Optional[str] = Query(None, description="Search term for real-time search"),
    client_type: Optional[str] = Query(None, description="Filter by client type: person, company"),
    limit: int = Query(50, description="Number of clients to return"),
    skip: int = Query(0, description="Number of clients to skip"),
    current_user: dict = Depends(get_current_user)
):
    """Get clients with optional search and filtering"""
    query = {}
    
    # Add type filter
    if client_type and client_type in ["person", "company"]:
        query["type"] = client_type
    
    # Add search functionality
    if search:
        search_pattern = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"data.first_name": search_pattern},
            {"data.last_name": search_pattern},
            {"data.company_name": search_pattern},
            {"data.contact_person": search_pattern},
            {"data.email": search_pattern},
            {"data.phone": search_pattern},
            {"data.company": search_pattern},
            {"notes.content": search_pattern}
        ]
    
    cursor = db.clients.find(query).skip(skip).limit(limit).sort("created_at", -1)
    clients = await cursor.to_list(length=limit)
    
    return clients

@app.post("/api/clients", response_model=Client)
async def create_client(
    client_data: ClientCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new client"""
    client = Client(
        type=client_data.type,
        data=client_data.data,
        ownership=client_data.ownership
    )
    
    # Generate SharePoint folder URL (mock)
    sharepoint_base = os.getenv("SHAREPOINT_SITE_URL", "https://mock.sharepoint.com")
    client_name = client_data.data.get("company_name") or f"{client_data.data.get('first_name', '')} {client_data.data.get('last_name', '')}"
    client.documents.sharepoint_folder_url = f"{sharepoint_base}/Client_{client.id}_{client_name.replace(' ', '_')}"
    
    result = await db.clients.insert_one(client.model_dump())
    return client

@app.get("/api/clients/{client_id}", response_model=Client)
async def get_client(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific client by ID"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.put("/api/clients/{client_id}", response_model=Client)
async def update_client(
    client_id: str,
    client_update: ClientUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a client"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = {k: v for k, v in client_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.clients.update_one({"id": client_id}, {"$set": update_data})
    
    updated_client = await db.clients.find_one({"id": client_id})
    return updated_client

@app.delete("/api/clients/{client_id}")
async def delete_client(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a client"""
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

@app.post("/api/clients/{client_id}/notes", response_model=Note)
async def add_note(
    client_id: str,
    note_content: str,
    current_user: dict = Depends(get_current_user)
):
    """Add a note to a client"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    note = Note(
        content=note_content,
        created_by=current_user.get("email", "unknown")
    )
    
    await db.clients.update_one(
        {"id": client_id},
        {"$push": {"notes": note.model_dump()}}
    )
    
    return note

@app.post("/api/clients/{client_id}/tracking", response_model=TrackingEntry)
async def add_tracking_entry(
    client_id: str,
    activity_type: str,
    description: str,
    outcome: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Add a tracking entry to a client"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    tracking_entry = TrackingEntry(
        activity_type=activity_type,
        description=description,
        outcome=outcome,
        created_by=current_user.get("email", "unknown")
    )
    
    await db.clients.update_one(
        {"id": client_id},
        {"$push": {"tracking": tracking_entry.model_dump()}}
    )
    
    return tracking_entry

@app.get("/api/clients/{client_id}/sharepoint-url")
async def get_sharepoint_url(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get SharePoint folder URL for a client"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    sharepoint_url = client.get("documents", {}).get("sharepoint_folder_url")
    if not sharepoint_url:
        # Generate mock SharePoint URL
        sharepoint_base = os.getenv("SHAREPOINT_SITE_URL", "https://mock.sharepoint.com")
        client_name = client["data"].get("company_name") or f"{client['data'].get('first_name', '')} {client['data'].get('last_name', '')}"
        sharepoint_url = f"{sharepoint_base}/Client_{client_id}_{client_name.replace(' ', '_')}"
    
    return {"sharepoint_url": sharepoint_url}

# Mock Microsoft Authentication endpoint
@app.post("/api/auth/microsoft")
async def microsoft_auth(token: str):
    """Mock Microsoft authentication endpoint"""
    # In real implementation, validate Microsoft token here
    if token == "mock-microsoft-token":
        return {
            "access_token": "mock-token",
            "user": {
                "email": "user@company.com",
                "name": "Mock User",
                "id": "mock-user-id"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid Microsoft token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)