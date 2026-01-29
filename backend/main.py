import asyncio
import uuid
import random
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from ai import get_ai_response
from token_storage import Sessions
from contextlib import asynccontextmanager
from actions import check_new_responses


lifespan_alive = True

async def continous_check():
    while lifespan_alive:
        await asyncio.sleep(1)
        dones: set[str] = set()
        for _, value in Sessions.copy().items():
            if (value["instagram_token"] is not None) and (value["instagram_token"] not in dones):
                dones.add(value["instagram_token"])
                await check_new_responses(value["instagram_token"])
            await asyncio.sleep(random.randint(4, 8))

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(continous_check())
    yield
    global lifespan_alive
    lifespan_alive = False


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://automate-platform.appkit.site"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/set-token/")
async def set_token(new_token: str = Body(..., embed=True), type: str = Body(..., embed=True)):
    session_id = str(uuid.uuid4())
    if type == "instagram":
        Sessions[session_id] = {"instagram_token": new_token}
    return {"message": "Token set successfully", "session_id": session_id}


@app.post("/is-connected/")
async def is_connected(session_id: str = Body(..., embed=True)):
    if session_id and session_id in Sessions:
        return {"connected": Sessions[session_id]["instagram_token"] is not None}
    return {"connected": False}

@app.post("/ai-message/")
async def ai_message(session_id: str = Body(..., embed=True), prompt: str = Body(..., embed=True)):
    if not session_id or session_id not in Sessions:
        return {"error": "Invalid session."}
    return await get_ai_response(session_id, prompt)