import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime
from core.security import get_password_hash, create_access_token
from api.models.users import Users, SystemRole
from api.models.enums.user import AccountStatus
from main import app
from core.dependencies import get_db

# Mock system roles
admin_role = SystemRole(id=1, name="Admin")
staff_role = SystemRole(id=2, name="Staff")

# Mock superuser (Admin)
admin_user = Users(
    id=1,
    username="admin",
    password=get_password_hash("adminpass123"),
    first_name="Admin",
    middle_name="Super",
    last_name="User",
    email="admin@gmail.com",
    birth_date=datetime(1990, 1, 1),
    position="Administrator",
    employee_number=10001,
    office="IT Office",
    division="IT Division",
    account_status=AccountStatus.ACTIVE,
    is_active=True,
    is_superuser=True,
    system_role_id=1,
    system_role=admin_role,
    created_at=datetime.now()
)

# Mock regular user (Non-superuser)
regular_user = Users(
    id=2,
    username="juan",
    password=get_password_hash("userpass123"),
    first_name="Juan",
    middle_name="Dela",
    last_name="Cruz",
    email="juan@gmail.com",
    birth_date=datetime(1995, 5, 5),
    position="Staff",
    employee_number=10002,
    office="IT Office",
    division="IT Division",
    account_status=AccountStatus.ACTIVE,
    is_active=True,
    is_superuser=False,
    system_role_id=2,
    system_role=staff_role,
    created_at=datetime.now()
)

# Sample payload for creating a new user
new_user_payload = {
    "username": "pedro",
    "password": "password123",
    "first_name": "Pedro",
    "middle_name": "Santos",
    "last_name": "Penduko",
    "email": "pedro@gmail.com",
    "birth_date": "1998-10-20T00:00:00",
    "position": "Programmer",
    "employee_number": 12345,
    "office": "IT Office",
    "division": "IT Division",
    "account_status": "active",
    "system_role": "Staff"
}

# State controller for mock DB queries
mock_db_state = {
    "duplicate_found": False
}

# Mock database session
class MockAsyncSession:
    async def execute(self, query):
        params = {}
        if hasattr(query, "compile"):
            try:
                params = query.compile().params
            except Exception:
                params = {}

        param_values = list(params.values())

        class MockResult:
            def scalars(self_inner):
                class MockScalars:
                    def first(self_inner2):
                        # Authenticate regular user
                        if "juan" in param_values:
                            return regular_user
                        # Authenticate admin superuser
                        if "admin" in param_values:
                            return admin_user

                        # Check for existing user duplicate
                        if mock_db_state["duplicate_found"]:
                            return regular_user
                        return None

                    def all(self_inner2):
                        # Return list of users
                        return [admin_user, regular_user]

                return MockScalars()
        return MockResult()

    def add(self, instance):
        # Attach system_role for response serialization
        if not getattr(instance, "system_role", None):
            instance.system_role = staff_role

    async def commit(self):
        pass

    async def refresh(self, instance):
        if not getattr(instance, "system_role", None):
            instance.system_role = staff_role

# Override get_db dependency
async def override_get_db():
    yield MockAsyncSession()

app.dependency_overrides[get_db] = override_get_db


# Test: Create user successfully as superuser
@pytest.mark.anyio
async def test_user_create_success():
    mock_db_state["duplicate_found"] = False
    admin_token = create_access_token(data={"sub": "admin"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/user_management/create",
            json=new_user_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "pedro"
        assert data["email"] == "pedro@gmail.com"
        assert data["is_active"] is True


# Test: Unauthorized when non-superuser tries to create user
@pytest.mark.anyio
async def test_user_create_unauthorized():
    mock_db_state["duplicate_found"] = False
    user_token = create_access_token(data={"sub": "juan"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/user_management/create",
            json=new_user_payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "you are not authorized"


# Test: Bad Request when username or email already exists
@pytest.mark.anyio
async def test_user_create_duplicate():
    mock_db_state["duplicate_found"] = True
    admin_token = create_access_token(data={"sub": "admin"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/user_management/create",
            json=new_user_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Username or email already exists"


# Test: Get users list as superuser
@pytest.mark.anyio
async def test_get_users_list_success():
    admin_token = create_access_token(data={"sub": "admin"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/user_management/lists",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2


# Test: Get users list fails for non-superuser
@pytest.mark.anyio
async def test_get_users_list_unauthorized():
    user_token = create_access_token(data={"sub": "juan"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/user_management/lists",
            headers={"Authorization": f"Bearer {user_token}"}
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "you are not authorized"