import asyncio
from datetime import datetime, date
from sqlalchemy import select, text
from core.database import SessionLocal
from core.security import get_password_hash
from api.models.users import Users, SystemRole
from api.models.document import DocumentCategory, DocumentStatus
from api.models.enums.user import AccountStatus


async def seed_data():
    """Seeds default system roles, document categories, document statuses, and 1 super admin user."""
    async with SessionLocal() as db:
        # 0. Ensure enum values exist in PostgreSQL
        print("[*] Ensuring document_enum values exist in PostgreSQL...")
        for enum_val in ["confidential", "internal", "public"]:
            try:
                await db.execute(text(f"ALTER TYPE document_enum ADD VALUE IF NOT EXISTS '{enum_val}'"))
                await db.commit()
            except Exception:
                await db.rollback()

        # 1. Ensure System Roles exist
        print("[*] Checking system roles...")
        roles_to_seed = ["Admin", "Staff"]
        admin_role = None
        for role_name in roles_to_seed:
            role = (await db.execute(select(SystemRole).where(SystemRole.name == role_name))).scalars().first()
            if not role:
                role = SystemRole(name=role_name)
                db.add(role)
                await db.commit()
                await db.refresh(role)
                print(f"[+] Created '{role_name}' SystemRole.")
            else:
                print(f"[✓] '{role_name}' SystemRole already exists.")

            if role_name == "Admin":
                admin_role = role

        # 2. Ensure Default Document Categories exist
        print("\n[*] Checking default document categories...")
        default_categories = ["General", "Legal", "Financial", "Technical", "Administrative", "Reports"]
        for cat_name in default_categories:
            cat = (await db.execute(select(DocumentCategory).where(DocumentCategory.name == cat_name))).scalars().first()
            if not cat:
                cat = DocumentCategory(name=cat_name, created_at=datetime.now())
                db.add(cat)
                await db.commit()
                await db.refresh(cat)
                print(f"[+] Created '{cat_name}' DocumentCategory (id={cat.id}).")
            else:
                print(f"[✓] '{cat_name}' DocumentCategory already exists (id={cat.id}).")

        # 3. Ensure Default Document Statuses exist
        print("\n[*] Checking default document statuses...")
        default_statuses = ["Draft", "Under Review", "Approved", "Archived"]
        for status_name in default_statuses:
            doc_status = (await db.execute(select(DocumentStatus).where(DocumentStatus.name == status_name))).scalars().first()
            if not doc_status:
                doc_status = DocumentStatus(name=status_name)
                db.add(doc_status)
                await db.commit()
                await db.refresh(doc_status)
                print(f"[+] Created '{status_name}' DocumentStatus (id={doc_status.id}).")
            else:
                print(f"[✓] '{status_name}' DocumentStatus already exists (id={doc_status.id}).")

        # 4. Check if Super Admin already exists
        print("\n[*] Checking for existing Super Admin...")
        existing_admin = (await db.execute(
            select(Users).where((Users.username == "admin") | (Users.email == "admin@example.com"))
        )).scalars().first()

        if existing_admin:
            print(f"[!] Super Admin already exists: username='{existing_admin.username}', email='{existing_admin.email}'")
            return

        # 5. Create the Super Admin user
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
    asyncio.run(seed_data())
