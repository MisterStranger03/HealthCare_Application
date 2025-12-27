from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, dashboard, subscription, feature, report, overview

app = FastAPI(title="Patient Healthcare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(subscription.router, prefix="/subscription", tags=["Subscription"])
app.include_router(feature.router, prefix="/feature", tags=["Feature"])
app.include_router(report.router, prefix="/report", tags=["Report"])
app.include_router(overview.router, prefix="/overview", tags=["Overview"])
