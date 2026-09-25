# core

**Qëllimi:** Infrastruktura e përbashkët e backend-it — konfig, lidhje me DB, siguri.

**Përmban:**
- config.py — lexon variablat nga .env (Supabase URL/key, pepper, session_secret, CORS) me pydantic-settings
- database.py — krijon klientin e Supabase me service_role key (cache me lru_cache)
- security.py — hash/verify i PIN-it (pepper + sha256 + bcrypt), token-a sesioni JWT (create/decode_session_token) dhe varësia require_auth: pranon `Authorization: Bearer <jwt>` (pa DB/bcrypt) ose fallback `X-PIN`
- forecast.py — ewma_forecast(daily, horizon, span, z): parashikim i sheshtë EWMA mbi serinë ditore + brez pasigurie nga std i mbetjeve; funksion i pastër, pa I/O e pa data
- flags.py — build_flags(...): flamuj "Vëmendje" për /summary nga të dhëna të para-marra (spend_pace/payday_negative/week_spike/sleep_short_streak/no_expense_recent/habit_silent/on_track); warn para info, maks 5; pa I/O
- insights.py — sleep_spend/weekday_spend/payday_window/fitness_habits: korrelacione mes moduleve mbi rreshta të para-marra, kthejnë dict|None sipas pragjeve minimale; pa I/O
- correlations.py — lagged_correlation_matrix: matricë korrelacionesh Spearman me vonesë 1-ditë (t→t+1) mes energy/mood/expense_next/habit_rate (rreshta) dhe sleep/work_hours/expense (kolona); scipy.stats.spearmanr për rho+p-value; vetëm çiftet me n≥30; korrigjim Benjamini–Hochberg (q=0.1) mbi p-values; pa I/O

**Lidhet me:** përdoret nga të gjitha routes/; security.py lexon tabelën app_auth vetëm te rruga fallback X-PIN dhe te /auth; forecast.py + flags.py thirren nga routes/summary.py; insights.py + correlations.py nga routes/insights.py
