from pydantic import BaseModel
from typing import Optional

class LocationCreate(BaseModel):
    code: str
    description: Optional[str] = None

class LocationOut(BaseModel):
    id: int
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True