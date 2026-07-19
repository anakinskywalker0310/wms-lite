from pydantic import BaseModel
from typing import Optional

# Dane, które klient wysyła, żeby stworzyć produkt
class ProductCreate(BaseModel):
    sku: str
    name: str
    category: Optional[str] = None
    quantity: int = 0
    min_threshold: int = 0

# Dane, które API zwraca (zawiera już id z bazy)
class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    category: Optional[str] = None
    quantity: int
    min_threshold: int

    class Config:
        from_attributes = True