import asyncio
from datetime import datetime, date
from sqlalchemy import select
from core.database import SessionLocal
from core.security import get_password_hash
from api.models.users import Users, SystemRole
from api.models.enums.user import AccountStatus


async def seed_super_admin():
    """Seeds default system roles and 1 super admin user."""
    async with SessionLocal() as db:
        print("[*] Checking system roles...")
        # 1. Ensure Admin role exists
        admin_role = (await db.execute(select(SystemRole).where(SystemRole.name == "Admin"))).scalars().first()
        if not admin_role:
            admin_role = SystemRole(name="Admin")
            db.add(admin_role)
            await db.commit()
            await db.refresh(admin_role)
            print("[+] Created 'Admin' SystemRole.")
        else:
            print("[✓] 'Admin' SystemRole already exists.")

        # 2. Ensure Staff role exists
        staff_role = (await db.execute(select(SystemRole).where(SystemRole.name == "Staff"))).scalars().first()
        if not staff_role:
            staff_role = SystemRole(name="Staff")
            db.add(staff_role)
            await db.commit()
            await db.refresh(staff_role)
            print("[+] Created 'Staff' SystemRole.")
        else:
            print("[✓] 'Staff' SystemRole already exists.")

        # 3. Check if Super Admin already exists
        print("[*] Checking for existing Super Admin...")
        existing_admin = (await db.execute(
            select(Users).where((Users.username == "admin") | (Users.email == "admin@example.com"))
        )).scalars().first()

        if existing_admin:
            print(f"[!] Super Admin already exists: username='{existing_admin.username}', email='{existing_admin.email}'")
            return

        # 4. Create the Super Admin user
        super_admin = Users(
            username="admin",
            password=get_password_hash("Admin123!"),
            first_name="Super",
            middle_name="Admin",
            last_name="User",
            email="admin@example.com",
            birth_date=date(1990, 1, 1),
            position="System Administrator",
            employee_number="ADMIN-0001",
            office="Main Office",
            division="IT Management",
            account_status=AccountStatus.ACTIVE,
            is_active=True,
            is_superuser=True,
            system_role_id=admin_role.id,
            created_at=datetime.now()
        )

        db.add(super_admin)
        await db.commit()
        await db.refresh(super_admin)

        print("\n" + "=" * 50)
        print("[✓] Super Admin successfully created!")
        print(f"    Username: admin")
        print(f"    Password: Admin123!")
        print(f"    Email:    admin@example.com")
        print(f"    Role:     Admin (Superuser)")
        print("=" * 50 + "\n")


if __name__ == "__main__":
    asyncio.run(seed_super_admin())
