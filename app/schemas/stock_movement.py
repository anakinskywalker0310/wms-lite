from pydantic import BaseModel
from datetime import datetime

class StockMovementCreate(BaseModel):
    product_id: int
    location_id: int
    movement_type: str
    quantity: int

class StockMovementOut(BaseModel):
    id: int
    product_id: int
    location_id: int
    movement_type: str
    quantity: int
    created_at: datetime

    class Config:
        from_attributes = True