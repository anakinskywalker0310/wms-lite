from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "WMS-lite API działa!"}


def test_get_products_returns_list():
    response = client.get("/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_product_requires_auth():
    response = client.post("/products", json={
        "sku": "TEST-NOAUTH",
        "name": "Produkt testowy",
        "category": "test",
        "quantity": 5,
        "min_threshold": 1,
    })
    assert response.status_code == 401


def test_get_nonexistent_product_returns_404():
    response = client.get("/products/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Produkt nie znaleziony"