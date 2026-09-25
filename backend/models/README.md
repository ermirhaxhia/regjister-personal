# models

**Qëllimi:** Modelet Pydantic për validim të kërkesave dhe formatim të përgjigjeve — një file për modul.

**Përmban:**
- auth.py — PinVerify, PinSet (PIN 4-8 shifra)
- collections.py — CollectionCreate/Update/Read (collections; status 'active'|'paused'|'finished'; total_amount opsional; +amount_total/pct_complete/entries_count/amount_per_day/estimated_finish vetëm lexim, llogaritur nga collection_entries); CollectionEntryCreate/Update/Read (collection_entries)
- dashboard.py — DashboardRead + DashboardDay (date/expense/income) / CategoryShare (category/amount/pct) (vetëm lexim, agregime mbi expenses + income për grafikët e dashboard-it)
- day.py — DayView (pamje ditore, vetëm lexim) + DayExpense / DayIncome / DaySleep / DayHabit / DayFitness / DayNote; amount dhe totalet si Decimal, duration_minutes i gjumit si float, colleague_name = name + last_name
- expenses.py — ExpenseCreate / ExpenseUpdate / ExpenseRead; ExpenseCategoryCreate / ExpenseCategoryUpdate / ExpenseCategoryOut (name trim, 1–60 karaktere; +expense_count vetëm lexim)
- habits.py — HabitCreate / HabitUpdate / HabitRead (tracking_type: 'binary'|'duration'); HabitLogUpsert / HabitLogRead; HabitGridRead + HabitGridRow / HabitGridCell (vetëm lexim)
- income.py — IncomeCreate / IncomeUpdate / IncomeRead (fusha kind: 'paga'|'tjeter') + AllocationRead; IncomeSourceCreate / IncomeSourceUpdate / IncomeSourceOut (name trim, 1–60 karaktere; +income_count vetëm lexim)
- insights.py — Insight (id/kind/title/detail/confidence 'low'|'medium'|'high'/data_points) + InsightsRead (insights[] + enough_data) (vetëm lexim); CorrelationCell (row/col/rho/n/significant) + CorrelationsRead (cells[]) (vetëm lexim)
- fitness.py — UNITS (vokabulari i njësive); ActivityTypeCreate/Update/Read (units nga vokabular, daily_goal↔goal_unit); FitnessEntryCreate/Update/Read (values {njesi:numër} ≥0, +activity_type_name); FitnessSummary + FitnessGoalBlock / FitnessSeriesPoint / FitnessRecentEntry (vetëm lexim)
- hr.py — CRM: WorkplaceCreate/Update/Read (sectors; +contact_count); ContactCreate/Update/Read (colleagues; +last_note_date; email me regex bazë, lejo bosh); NoteCreate/Update/Read (contact_log; note jo bosh, contact_date default sot)
- settings.py — SleepGoalRead / SleepGoalUpdate (goal_minutes, ge=60/le=960; app_settings.sleep_goal_minutes); OpeningBalanceRead (amount, locked) / OpeningBalanceCreate (amount ge=0; app_settings.opening_balance, vendoset një herë)
- sleep.py — SleepCreate (kontrollon sleep_end > sleep_start) / SleepUpdate / SleepRead
- summary.py — SummaryRead + SpendingBlock / BudgetBlock / SeriesPoint / BiggestExpense / TopCategory / ForecastBlock + ForecastPoint (parashikim EWMA, ready + reason/method/total_lo..hi/points) + Flag (id/severity 'warn'|'info'/module/text) (vetëm lexim)

**Lidhet me:** përdoren nga routes/; pasqyrojnë kolonat e tabelave te schema.sql
