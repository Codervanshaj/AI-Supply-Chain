from app.core.database import Base, engine, session_scope
from app.services.seed import seed_demo_data


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with session_scope() as session:
        seed_demo_data(session)
    print("Demo data seeded.")


if __name__ == "__main__":
    main()

