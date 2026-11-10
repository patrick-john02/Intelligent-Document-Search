import asyncio
from datetime import datetime, date
from sqlalchemy import select, text
from core.database import SessionLocal
from core.security import get_password_hash
from api.models.users import Users, SystemRole
from api.models.document import DocumentCategory, DocumentStatus
from api.models.enums.user import AccountStatus


async def seed_data():
    """Seeds default system roles, categories, statuses, and 1 user per role."""
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
        print("\n[*] Checking system roles...")
        roles_to_seed = ["Admin", "Staff"]
        roles_map = {}
        for role_name in roles_to_seed:
            role = (await db.execute(select(SystemRole).where(SystemRole.name == role_name))).scalars().first()
            if not role:
                role = SystemRole(name=role_name)
                db.add(role)
                await db.commit()
                await db.refresh(role)
                print(f"[+] Created '{role_name}' SystemRole (id={role.id}).")
            else:
                print(f"[✓] '{role_name}' SystemRole already exists (id={role.id}).")
            roles_map[role_name] = role

        admin_role = roles_map["Admin"]
        staff_role = roles_map["Staff"]

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

        # 4. Seed Users: 1 per role (Developer/Superadmin, Admin Officer, Staff)
        print("\n[*] Seeding 1 user per role...")

        users_to_seed = [
            {
                "username": "developer",
                "alt_username": "admin",
                "password": "Admin123!",
                "first_name": "Alex",
                "middle_name": "Dev",
                "last_name": "Morgan",
                "email": "developer@example.com",
                "position": "Lead Systems Engineer",
                "employee_number": "DEV-0001",
                "office": "IT & Systems Directorate",
                "division": "Core Infrastructure",
                "system_role_id": admin_role.id,
                "is_superuser": True,
                "role_label": "Developer (Super Admin)",
            },
            {
                "username": "admin_user",
                "alt_username": None,
                "password": "Admin123!",
                "first_name": "Marcus",
                "middle_name": "V.",
                "last_name": "Vance",
                "email": "admin.user@example.com",
                "position": "Administrative Officer",
                "employee_number": "ADM-0002",
                "office": "City Administrator Office",
                "division": "Records & Compliance",
                "system_role_id": admin_role.id,
                "is_superuser": False,
                "role_label": "Admin Officer",
            },
            {
                "username": "staff_user",
                "alt_username": None,
                "password": "Staff123!",
                "first_name": "Elena",
                "middle_name": "R.",
                "last_name": "Reyes",
                "email": "staff.user@example.com",
                "position": "Records Staff Specialist",
                "employee_number": "STF-0001",
                "office": "Department of Public Records",
                "division": "General Archive Division",
                "system_role_id": staff_role.id,
                "is_superuser": False,
                "role_label": "Staff Member",
            },
        ]

        # Also ensure original 'admin' user has proper superuser/admin role
        existing_admin = (await db.execute(select(Users).where(Users.username == "admin"))).scalars().first()
        if existing_admin:
            existing_admin.system_role_id = admin_role.id
            existing_admin.is_superuser = True
            existing_admin.is_active = True
            existing_admin.password = get_password_hash("Admin123!")
            await db.commit()
            print("[✓] Updated existing 'admin' user -> Role: Admin (is_superuser=True)")

        for udata in users_to_seed:
            uname = udata["username"]
            user = (await db.execute(
                select(Users).where((Users.username == uname) | (Users.email == udata["email"]))
            )).scalars().first()

            if user:
                # Update role and credentials to match configuration
                user.system_role_id = udata["system_role_id"]
                user.is_superuser = udata["is_superuser"]
                user.is_active = True
                user.password = get_password_hash(udata["password"])
                user.position = udata["position"]
                user.employee_number = udata["employee_number"]
                user.office = udata["office"]
                user.division = udata["division"]
                user.updated_at = datetime.now()
                await db.commit()
                print(f"[✓] User '{uname}' already exists - verified & updated ({udata['role_label']}).")
            else:
                new_user = Users(
                    username=uname,
                    password=get_password_hash(udata["password"]),
                    first_name=udata["first_name"],
                    middle_name=udata["middle_name"],
                    last_name=udata["last_name"],
                    email=udata["email"],
                    birth_date=date(1992, 5, 15),
                    position=udata["position"],
                    employee_number=udata["employee_number"],
                    office=udata["office"],
                    division=udata["division"],
                    account_status=AccountStatus.ACTIVE,
                    is_active=True,
                    is_superuser=udata["is_superuser"],
                    system_role_id=udata["system_role_id"],
                    created_at=datetime.now(),
                )
                db.add(new_user)
                await db.commit()
                await db.refresh(new_user)
                print(f"[+] Created user '{uname}' ({udata['role_label']}).")

        print("\n" + "=" * 60)
        print("SEEDING COMPLETE: 1 User Per Role Ready for Login")
        print("=" * 60)
        print("1. DEVELOPER / SUPER ADMIN:")
        print("   Username: developer  (or 'admin')")
        print("   Password: Admin123!")
        print("   Role:     Super Admin View (system_role_id=1, is_superuser=True)")
        print("\n2. ADMIN OFFICER:")
        print("   Username: admin_user")
        print("   Password: Admin123!")
        print("   Role:     Admin View (system_role_id=1, is_superuser=False)")
        print("\n3. STAFF MEMBER:")
        print("   Username: staff_user")
        print("   Password: Staff123!")
        print("   Role:     Staff View (system_role_id=2, is_superuser=False)")
        print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(seed_data())
