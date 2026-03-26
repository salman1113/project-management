from pydantic import BaseModel

# What user sends to login
class LoginRequest(BaseModel):
    email: str
    password: str

# What we send back after login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"