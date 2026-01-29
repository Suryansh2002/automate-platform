from typing import TypedDict


class TokenData(TypedDict):
    instagram_token: str|None


Storage: TokenData = {
    "instagram_token": None,
}