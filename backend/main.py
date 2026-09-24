from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from routes import (
    activity_types,
    auth,
    contacts,
    dashboard,
    day,
    expense_categories,
    expenses,
    fitness,
    habits,
    income,
    income_sources,
    insights,
    settings as settings_route,
    sleep,
    summary,
    workplaces,
)

settings = get_settings()

app = FastAPI(title="Regjistri Personal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity_types.router)
app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(dashboard.router)
app.include_router(day.router)
app.include_router(expense_categories.router)
app.include_router(expenses.router)
app.include_router(fitness.router)
app.include_router(habits.router)
app.include_router(income.router)
app.include_router(income_sources.router)
app.include_router(insights.router)
app.include_router(settings_route.router)
app.include_router(sleep.router)
app.include_router(summary.router)
app.include_router(workplaces.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
