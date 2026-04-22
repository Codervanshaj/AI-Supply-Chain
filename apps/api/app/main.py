from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, session_scope
from app.services.seed import seed_demo_data

logger = logging.getLogger("supplychain.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.warning("API startup: beginning database bootstrap")
    try:
        Base.metadata.create_all(bind=engine)
        logger.warning("API startup: database schema ensured")
        with session_scope() as session:
            seed_demo_data(session)
        logger.warning("API startup: demo seed complete")
    except Exception:
        logger.exception("API startup failed during database bootstrap")
        raise
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
