from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import Base, engine, SessionLocal
from app import models
from app import schemas
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WMS-lite")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "WMS-lite API działa!"}


# ---------- PRODUKTY ----------

@app.get("/products", response_model=list[schemas.ProductOut])
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products


@app.post("/products", response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Produkt z SKU '{product.sku}' już istnieje")
    db.refresh(db_product)
    return db_product


@app.get("/products/alerts/low-stock", response_model=list[schemas.ProductOut])
def get_low_stock_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.quantity < models.Product.min_threshold).all()
    return products


@app.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produkt nie znaleziony")
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Produkt nie znaleziony")

    for key, value in product.model_dump().items():
        setattr(db_product, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Produkt z SKU '{product.sku}' już istnieje")

    db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager")),
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Produkt nie znaleziony")

    db.delete(db_product)
    db.commit()
    return {"message": f"Produkt o id {product_id} został usunięty"}


# ---------- LOKALIZACJE ----------

@app.get("/locations", response_model=list[schemas.LocationOut])
def get_locations(db: Session = Depends(get_db)):
    locations = db.query(models.Location).all()
    return locations


@app.post("/locations", response_model=schemas.LocationOut)
def create_location(
    location: schemas.LocationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_location = models.Location(**location.model_dump())
    db.add(db_location)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Lokalizacja z kodem '{location.code}' już istnieje")
    db.refresh(db_location)
    return db_location


@app.get("/locations/{location_id}", response_model=schemas.LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if location is None:
        raise HTTPException(status_code=404, detail="Lokalizacja nie znaleziona")
    return location


@app.put("/locations/{location_id}", response_model=schemas.LocationOut)
def update_location(
    location_id: int,
    location: schemas.LocationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Lokalizacja nie znaleziona")

    for key, value in location.model_dump().items():
        setattr(db_location, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Lokalizacja z kodem '{location.code}' już istnieje")

    db.refresh(db_location)
    return db_location


@app.delete("/locations/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager")),
):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Lokalizacja nie znaleziona")

    db.delete(db_location)
    db.commit()
    return {"message": f"Lokalizacja o id {location_id} została usunięta"}


# ---------- RUCHY MAGAZYNOWE ----------

@app.get("/stock-movements", response_model=list[schemas.StockMovementOut])
def get_stock_movements(db: Session = Depends(get_db)):
    movements = db.query(models.StockMovement).all()
    return movements


@app.post("/stock-movements", response_model=schemas.StockMovementOut)
def create_stock_movement(
    movement: schemas.StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produkt nie znaleziony")

    location = db.query(models.Location).filter(models.Location.id == movement.location_id).first()
    if location is None:
        raise HTTPException(status_code=404, detail="Lokalizacja nie znaleziona")

    db_movement = models.StockMovement(**movement.model_dump())
    db.add(db_movement)

    if movement.movement_type == "in":
        product.quantity += movement.quantity
    elif movement.movement_type == "out":
        if product.quantity < movement.quantity:
            raise HTTPException(status_code=400, detail="Niewystarczająca ilość na stanie")
        product.quantity -= movement.quantity

    db.commit()
    db.refresh(db_movement)
    return db_movement


# ---------- UŻYTKOWNICY / AUTORYZACJA ----------

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik o tej nazwie już istnieje")

    db_user = models.User(
        username=user.username,
        hashed_password=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user is None or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Nieprawidłowa nazwa użytkownika lub hasło")

    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}