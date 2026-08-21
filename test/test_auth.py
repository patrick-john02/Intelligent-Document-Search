import pytest
import api.models
from httpx import AsyncClient,ASGITransport
from core.security import get_password_hash , create_access_token
from api.models.users import Users
from api.models.enums.user import AccountStatus
from datetime import date , datetime
from main import app
from core.dependencies import get_db

test_pass = get_password_hash("meowmeowmeow")


user_test = Users(
    id=1,
    username="juan",
    password=test_pass,
    first_name="Juan",
    middle_name="Dela",
    last_name="Cruz",
    email="juan@gmail.com",
    birth_date=date(1990,1,1),
    position="Programmer",
    employee_number="12345",
    office="IT Office",
    division="IT Division",
    account_status=AccountStatus.ACTIVE,
    is_active=True,
    is_superuser=False,
    system_role_id=1,
    created_at=datetime.now()
)

class MockAsyncSession:
    async def execute(self, query):
        class MockResult:
            def scalars(self):
                class MockScalars:
                    def first(self_inner):
                        return user_test
                
                return MockScalars()
        return MockResult()
    
async def override_get_db():
    yield MockAsyncSession()
    

app.dependency_overrides[get_db] = override_get_db

@pytest.mark.anyio
async def test_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response =await client.post(
            "api/token",
            data={
                "username":"juan",
                "password":"meowmeowmeow"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
            
        )
        
        assert response.status_code==200
        data=response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        

@pytest.mark.anyio
async def test_wrong_pass():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "api/token",
            data={
                "username":"juan",
                "password":"meownot123"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
            
        assert response.status_code ==401
        assert response.json()["detail"] == "Incorrect Username or Password"


@pytest.mark.anyio
async def test_rout_with_token():
    token = create_access_token(data={"sub": "juan"})
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        
        response = await client.get(
            "api/user/me",
            headers={"Authorization": f"Bearer {token}"}
            
        )
        
        assert response.status_code==200
        data=response.json()
        assert data["username"] == "juan"
        assert data["email"] == "juan@gmail.com"