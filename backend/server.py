from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import secrets
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
from authlib.integrations.starlette_client import OAuth
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Vimukti - Mental Wellness Platform")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=os.environ.get('SECRET_KEY', secrets.token_hex(32)))

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# OAuth setup for Google
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Enhanced Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    age: Optional[str] = None
    zodiac_sign: Optional[str] = None
    profession: Optional[str] = None
    personality_type: Optional[str] = None  # MBTI
    personality_archetype: Optional[str] = None
    onboarding_completed: bool = False
    session_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    content: str
    role: str  # 'user' or 'assistant'
    emotion_detected: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OnboardingResponse(BaseModel):
    user_id: str
    responses: Dict[str, Any]
    personality_archetype: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    message: str
    emotion_detected: Optional[str] = None
    session_id: str

class LoginResponse(BaseModel):
    user: User
    session_token: str

# Authentication middleware
async def get_current_user(request: Request) -> User:
    session_token = request.headers.get('Authorization')
    if not session_token:
        raise HTTPException(status_code=401, detail="No session token provided")
    
    session_token = session_token.replace('Bearer ', '')
    
    # Find user by session token
    user_data = await db.users.find_one({"session_token": session_token})
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid session token")
    
    return User(**user_data)

# Helper function to create personalized system message
def create_personalized_system_message(user: User) -> str:
    base_therapeutic_prompt = """You are an emotionally intelligent AI therapist equipped with multiple evidence-based psychological methodologies. Your primary role is to provide supportive, therapeutic conversations using specific psychological frameworks while maintaining appropriate boundaries. You implement the following psychological approaches based on user needs:

Core Psychological Methods Implementation
- Cognitive Behavioral Therapy (CBT) - Identify and challenge negative thought patterns, automatic thoughts, and cognitive distortions
- Dialectical Behavior Therapy (DBT) - Apply mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness
- Mindfulness-Based Cognitive Therapy (MBCT) - Integrate mindfulness practices with cognitive awareness
- Solution-Focused Brief Therapy (SFBT) - Focus on strengths, resources, and solutions
- Motivational Interviewing - Use reflective listening and collaborative goal-setting"""

    # Personalization layer
    personalization = f"""
    
USER PROFILE PERSONALIZATION:
"""
    
    if user.age:
        age = int(user.age)
        if age < 25:
            personalization += "- Age Group: Gen Z/Young Adult - Use casual, supportive language with modern references and emoji when appropriate\n"
        elif age < 40:
            personalization += "- Age Group: Millennial - Balance casual and professional tone, relate to work-life balance challenges\n"
        elif age < 55:
            personalization += "- Age Group: Gen X - Use professional, straightforward communication with practical focus\n"
        else:
            personalization += "- Age Group: Boomer+ - Use respectful, detailed explanations with formal but warm tone\n"
    
    if user.zodiac_sign:
        zodiac_traits = {
            'Aries': 'Direct, energetic communication; appreciate quick, actionable advice',
            'Taurus': 'Practical, steady approach; prefer detailed, reliable guidance',
            'Gemini': 'Witty, versatile conversations; enjoy variety and intellectual engagement',
            'Cancer': 'Empathetic, nurturing tone; focus on emotional validation and security',
            'Leo': 'Warm, encouraging responses; appreciate recognition and positive reinforcement',
            'Virgo': 'Detailed, helpful responses; prefer systematic, analytical approaches',
            'Libra': 'Balanced, harmonious communication; focus on relationship and fairness themes',
            'Scorpio': 'Deep, intense conversations; comfortable with emotional depth and transformation',
            'Sagittarius': 'Optimistic, philosophical discussions; enjoy growth and adventure themes',
            'Capricorn': 'Goal-oriented, practical advice; appreciate structure and achievement focus',
            'Aquarius': 'Innovative, humanitarian perspective; enjoy unique insights and social themes',
            'Pisces': 'Compassionate, intuitive responses; comfortable with emotions and creativity'
        }
        trait = zodiac_traits.get(user.zodiac_sign, 'Balanced approach')
        personalization += f"- Zodiac ({user.zodiac_sign}): {trait}\n"
    
    if user.profession:
        personalization += f"- Professional Context ({user.profession}): Adapt language and examples to their work environment and industry challenges\n"
    
    if user.personality_type:
        mbti_guidance = {
            'E': 'Engage socially, discuss relationships and external processing',
            'I': 'Respect need for reflection, allow processing time',
            'S': 'Focus on practical, concrete details and present realities',
            'N': 'Explore patterns, possibilities, and future potential',
            'T': 'Use logical structure, objective analysis',
            'F': 'Consider values, emotions, and impact on people',
            'J': 'Provide structure, clear steps, and organized approaches',
            'P': 'Stay flexible, explore options, adapt as needed'
        }
        
        type_guidance = []
        for letter in user.personality_type:
            if letter in mbti_guidance:
                type_guidance.append(mbti_guidance[letter])
        
        if type_guidance:
            personalization += f"- Personality Type ({user.personality_type}): {'; '.join(type_guidance)}\n"
    
    personalization += """
    
THERAPEUTIC BOUNDARIES: Never provide clinical diagnoses, suggest professional consultation when appropriate, maintain confidentiality, avoid medical advice, recognize AI limitations, provide crisis resources when needed.

Adapt your response style to this user's unique profile while maintaining therapeutic effectiveness and authenticity."""

    return base_therapeutic_prompt + personalization

# Routes
@api_router.get("/")
async def root():
    return {"message": "Vimukti - Mental Wellness Platform API"}

@api_router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/auth/google"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@api_router.get("/auth/google")
async def auth_google(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_info['email']})
        
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        
        if existing_user:
            # Update session token
            await db.users.update_one(
                {"email": user_info['email']},
                {"$set": {"session_token": session_token, "updated_at": datetime.utcnow()}}
            )
            user = User(**existing_user)
            user.session_token = session_token
        else:
            # Create new user
            user = User(
                email=user_info['email'],
                name=user_info['name'],
                picture=user_info.get('picture'),
                session_token=session_token
            )
            await db.users.insert_one(user.dict())
        
        # Redirect to frontend with session token
        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000').replace(':8001', ':3000')
        redirect_url = f"{frontend_url}/auth/callback?session_token={session_token}"
        
        from starlette.responses import RedirectResponse
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logging.error(f"OAuth error: {str(e)}")
        # Redirect to frontend with error
        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000').replace(':8001', ':3000')
        redirect_url = f"{frontend_url}/?error=oauth_failed"
        from starlette.responses import RedirectResponse
        return RedirectResponse(url=redirect_url)

@api_router.get("/auth/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/onboarding")
async def complete_onboarding(
    onboarding_data: OnboardingResponse,
    current_user: User = Depends(get_current_user)
):
    try:
        # Extract data from onboarding responses
        responses = onboarding_data.responses
        
        # Update user with onboarding data
        update_data = {
            "personality_archetype": onboarding_data.personality_archetype,
            "onboarding_completed": True,
            "updated_at": datetime.utcnow()
        }
        
        # Add profile data if available
        if 'name' in responses:
            update_data['name'] = responses['name']
        if 'age' in responses:
            update_data['age'] = responses['age']
        if 'zodiacSign' in responses:
            update_data['zodiac_sign'] = responses['zodiacSign']
        if 'profession' in responses:
            update_data['profession'] = responses['profession']
        if 'mbtiType' in responses:
            update_data['personality_type'] = responses['mbtiType']
        
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
        
        return {"message": "Onboarding completed", "archetype": onboarding_data.personality_archetype}
    
    except Exception as e:
        logging.error(f"Onboarding error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding")

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Initialize Mistral chat
        mistral_api_key = os.environ.get('MISTRAL_API_KEY')
        if not mistral_api_key:
            raise HTTPException(status_code=500, detail="Mistral API key not configured")
        
        # Create personalized system message
        system_message = create_personalized_system_message(current_user)
        
        chat = LlmChat(
            api_key=mistral_api_key,
            session_id=chat_request.session_id,
            system_message=system_message
        ).with_model("mistral", "mistral-small")
        
        # Send user message
        user_message = UserMessage(text=chat_request.message)
        ai_response = await chat.send_message(user_message)
        
        # Save user message
        user_msg = ChatMessage(
            session_id=chat_request.session_id,
            user_id=current_user.id,
            content=chat_request.message,
            role="user"
        )
        await db.chat_messages.insert_one(user_msg.dict())
        
        # Save AI response
        ai_msg = ChatMessage(
            session_id=chat_request.session_id,
            user_id=current_user.id,
            content=ai_response,
            role="assistant"
        )
        await db.chat_messages.insert_one(ai_msg.dict())
        
        # Create or update chat session
        existing_session = await db.chat_sessions.find_one({"id": chat_request.session_id})
        if not existing_session:
            session = ChatSession(
                id=chat_request.session_id,
                user_id=current_user.id,
                title=chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
            )
            await db.chat_sessions.insert_one(session.dict())
        else:
            await db.chat_sessions.update_one(
                {"id": chat_request.session_id},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
        
        return ChatResponse(
            message=ai_response,
            session_id=chat_request.session_id
        )
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@api_router.get("/chat/sessions")
async def get_chat_sessions(current_user: User = Depends(get_current_user)):
    sessions = await db.chat_sessions.find(
        {"user_id": current_user.id}
    ).sort("updated_at", -1).to_list(50)
    
    return [ChatSession(**session) for session in sessions]

@api_router.get("/chat/sessions/{session_id}/messages")
async def get_chat_messages(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    messages = await db.chat_messages.find(
        {"session_id": session_id, "user_id": current_user.id}
    ).sort("timestamp", 1).to_list(1000)
    
    return [ChatMessage(**message) for message in messages]

@api_router.post("/chat/sessions")
async def create_chat_session(current_user: User = Depends(get_current_user)):
    session = ChatSession(user_id=current_user.id, title="New Chat")
    await db.chat_sessions.insert_one(session.dict())
    return session

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()