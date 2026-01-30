from typing import TypedDict


class TokenData(TypedDict):
    instagram_token: str|None
    valid_till: float


Sessions: dict[str, TokenData] = {}