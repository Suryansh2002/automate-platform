import os
import json
import asyncio
from openai import OpenAI
from typing import Any
from actions import send_instagram_message
from token_storage import Sessions

client = OpenAI(api_key=os.getenv("OPENAI_TOKEN"))

tools: list[dict[str, Any]] = [
    {
        "type": "function",
        "name": "send_instagram_message",
        "description": "Sends a message to a specified Instagram user.",
        "parameters": {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string",
                    "description": "The Instagram username of the recipient."
                },
                "message": {
                    "type": "string",
                    "description": "The message content to be sent."
                }
            },
            "required": ["username", "message"]
        }
    }
]

async def respond_to_new_messages(message: str) -> str:
    response = await asyncio.to_thread(
        client.responses.create,
        model="gpt-5",
        input=[
            {"role": "developer", "content": "You are an AI assistant that helps respond to Instagram messages, act like a human, and just respond to the final message!"},
            {"role": "user", "content": message},
            {"role": "user", "content": "Generate a simple response to the incoming last message."}
        ]
    )
    for item in response.output:
        if item.type == "reasoning":
            continue
        if item.type == "message":
            return item.content[0].text  # pyright: ignore
    return "Okay."



async def get_ai_response(session_id: str, prompt: str) -> str|None:
    response = await asyncio.to_thread(
        client.responses.create,
        model="gpt-5",
        tools=tools, # pyright: ignore
        input=[
            {"role": "developer", "content": "You are an AI helper that can send messages to users on various platforms and reply to them automatically."},
            {"role": "user", "content": prompt}
        ]
    )
    for item in response.output:
        if item.type == "reasoning":
            continue
        if item.type == "message":
            return item.content[0].text # pyright: ignore
        if item.type == "function_call":
            if item.name == "send_instagram_message":
                args = json.loads(item.arguments)
                if Sessions[session_id]["instagram_token"] is None:
                    return "Your Instagram account is not connected !"
                
                msg = await send_instagram_message(
                    session_id=Sessions[session_id]["instagram_token"] or "",
                    author_username=args["username"],
                    message=args["message"]
                )
                if msg:
                    return msg

                return f"Message sent to {args['username']} via Instagram\nMessage Content: {args['message']}"
