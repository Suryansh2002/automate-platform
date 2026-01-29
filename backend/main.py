import asyncio
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from ai import get_ai_response
from token_storage import Storage
from contextlib import asynccontextmanager
from actions import check_new_responses


lifespan_alive = True

async def continous_check():
    while lifespan_alive:
        if Storage["instagram_token"] is not None:
            await check_new_responses(Storage["instagram_token"])
        await asyncio.sleep(4)

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
    if type == "instagram":
        Storage["instagram_token"] = new_token
    return {"message": "Token set successfully"}


@app.get("/is-connected/")
async def is_connected():
    return {"connected": Storage["instagram_token"] is not None}

@app.post("/ai-message/")
async def ai_message(prompt: str = Body(..., embed=True)):
    return await get_ai_response(prompt)