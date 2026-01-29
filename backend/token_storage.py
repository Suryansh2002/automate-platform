from typing import TypedDict


class TokenData(TypedDict):
    instagram_token: str|None


Sessions: dict[str, TokenData] = {}