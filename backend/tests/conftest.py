import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.models.user import User
from app.core.security import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture
def client(setup_database):
    def override_get_db():
        try:
            yield setup_database
        finally:
            setup_database.close()
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture
def test_user(setup_database):
    hashed_pwd = hash_password("testpass123")
    user = User(
        name="Test User",
        email="test@user.com",
        password=hashed_pwd,
        role="developer"
    )
    setup_database.add(user)
    setup_database.commit()
    setup_database.refresh(user)
    return user

@pytest.fixture
def token_headers(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@user.com", "password": "testpass123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}
