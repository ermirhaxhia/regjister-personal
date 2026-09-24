const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const SESSION_KEY = "rp_pin";
export const TOKEN_KEY = "rp_token";

export class ApiNetworkError extends Error {
  constructor(message = "S'u lidh dot me serverin") {
    super(message);
    this.name = "ApiNetworkError";
  }
}

interface VerifyResponse {
  ok?: boolean;
  token?: string;
  expires_in?: number;
}

export async function verifyPin(pin: string): Promise<string | boolean> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
  } catch {
    throw new ApiNetworkError();
  }

  if (res.status === 200) {
    let token: string | undefined;
    try {
      const data = (await res.json()) as VerifyResponse;
      if (typeof data?.token === "string" && data.token) token = data.token;
    } catch {
      token = undefined;
    }
    return token ?? true;
  }
  if (res.status === 401) return false;
  throw new ApiNetworkError(`Përgjigje e papritur nga serveri (${res.status})`);
}

function notifySession(): void {
  window.dispatchEvent(new Event("rp-session"));
}

export function storePin(pin: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, pin);
  notifySession();
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  notifySession();
}

export function getStoredPin(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function hasSession(): boolean {
  return Boolean(getStoredToken() || getStoredPin());
}

export function clearPin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  notifySession();
}

export function changePin(
  currentPin: string,
  newPin: string,
): Promise<{ ok: boolean }> {
  return apiPost("/auth/pin", { current_pin: currentPin, new_pin: newPin });
}

export function isAbortError(err: unknown): boolean {
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    return err.name === "AbortError";
  }
  return err instanceof Error && err.name === "AbortError";
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getStoredToken();
  const pin = getStoredPin();
  const auth: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : pin
      ? { "X-PIN": pin }
      : {};
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...auth,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "S'u lidh dot me serverin");
  }

  if (res.status === 401) {
    clearPin();
    if (typeof window !== "undefined") window.location.replace("/");
    throw new ApiError(401, "Sesioni skadoi");
  }

  if (res.status === 204) return undefined as T;

  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!res.ok) {
    let msg = `Gabim ${res.status}`;
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string") msg = detail;
      else if (Array.isArray(detail) && detail[0]?.msg) msg = String(detail[0].msg);
    } else if (typeof data === "string" && data) {
      msg = data;
    }
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body ?? {});
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body ?? {});
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, body ?? {});
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

function qs(params?: Record<string, string | undefined | null>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v != null && v !== "",
  ) as [string, string][];
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

export interface SummarySpending {
  today: number;
  yesterday: number;
  week_current: number;
  week_previous: number;
  month_current: number;
  month_previous: number;
}

export interface SummaryBudget {
  personal_allocation: number;
  spent_since_salary: number;
  remaining: number;
  days_elapsed: number;
  days_to_next_salary: number;
  daily_rate: number;
  daily_allowed: number;
  projected_at_payday: number | null;
}

export interface SummarySeriesPoint {
  date: string;
  amount: number;
}

export interface SummaryForecastPoint {
  date: string;
  yhat: number;
  lo: number;
  hi: number;
}

export interface SummaryForecast {
  ready: boolean;
  reason: string | null;
  method: string | null;
  horizon: number;
  daily: number | null;
  total: number | null;
  total_lo: number | null;
  total_hi: number | null;
  points: SummaryForecastPoint[];
  history_days: number;
  nonzero_days: number;
}

export interface SummaryFlag {
  id: string;
  severity: "warn" | "info";
  module: "expenses" | "sleep" | "habits" | "general";
  text: string;
}

export interface Summary {
  balance_total: number;
  balance_change_month: number;
  spending: SummarySpending;
  budget: SummaryBudget | null;
  series_30d: SummarySeriesPoint[];
  biggest_expense_week: { category: string; amount: number; date: string } | null;
  top_category_month: { category: string; amount: number; pct: number } | null;
  forecast: SummaryForecast | null;
  flags: SummaryFlag[];
}

export function getSummary(): Promise<Summary> {
  return apiGet<Summary>("/summary");
}

export interface Insight {
  id: string;
  kind: "sleep_spend" | "weekday_spend" | "payday_window" | "fitness_habits";
  title: string;
  detail: string;
  confidence: "low" | "medium" | "high";
  data_points: number;
}

export interface InsightsRead {
  insights: Insight[];
  enough_data: boolean;
}

export function getInsights(): Promise<InsightsRead> {
  return apiGet<InsightsRead>("/insights");
}

export interface Expense {
  id: string;
  amount: string;
  category: string;
  entry_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  amount: number;
  category: string;
  entry_date?: string;
  description?: string | null;
}

export function listExpenses(params?: {
  date_from?: string;
  date_to?: string;
  category?: string;
}): Promise<Expense[]> {
  return apiGet<Expense[]>(`/expenses${qs(params)}`);
}

export function createExpense(body: ExpenseInput): Promise<Expense> {
  return apiPost<Expense>("/expenses", body);
}

export function updateExpense(
  id: string,
  patch: Partial<ExpenseInput>,
): Promise<Expense> {
  return apiPatch<Expense>(`/expenses/${id}`, patch);
}

export function deleteExpense(id: string): Promise<void> {
  return apiDelete(`/expenses/${id}`);
}

export interface ExpenseCategory {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  expense_count: number;
}

export function listExpenseCategories(): Promise<ExpenseCategory[]> {
  return apiGet<ExpenseCategory[]>("/expense-categories");
}

export function createExpenseCategory(name: string): Promise<ExpenseCategory> {
  return apiPost<ExpenseCategory>("/expense-categories", { name });
}

export function updateExpenseCategory(
  id: string,
  name: string,
): Promise<ExpenseCategory> {
  return apiPatch<ExpenseCategory>(`/expense-categories/${id}`, { name });
}

export function deleteExpenseCategory(
  id: string,
): Promise<{ deleted: boolean; expense_count: number }> {
  return apiDelete<{ deleted: boolean; expense_count: number }>(
    `/expense-categories/${id}`,
  );
}

export interface IncomeSource {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  income_count: number;
}

export function listIncomeSources(): Promise<IncomeSource[]> {
  return apiGet<IncomeSource[]>("/income-sources");
}

export function createIncomeSource(name: string): Promise<IncomeSource> {
  return apiPost<IncomeSource>("/income-sources", { name });
}

export function updateIncomeSource(
  id: string,
  name: string,
): Promise<IncomeSource> {
  return apiPatch<IncomeSource>(`/income-sources/${id}`, { name });
}

export function deleteIncomeSource(
  id: string,
): Promise<{ deleted: boolean; income_count: number }> {
  return apiDelete<{ deleted: boolean; income_count: number }>(
    `/income-sources/${id}`,
  );
}

export interface IncomeAllocation {
  id: string;
  bucket: "personale" | "familje";
  amount: string;
  percentage: string;
}

export type IncomeKind = "paga" | "tjeter";

export interface Income {
  id: string;
  amount: string;
  kind: IncomeKind;
  period_month: string;
  received_on: string;
  source: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  allocations: IncomeAllocation[];
}

export interface IncomeInput {
  amount: number;
  kind?: IncomeKind;
  period_month: string;
  received_on?: string;
  source?: string | null;
  note?: string | null;
}

export function listIncome(): Promise<Income[]> {
  return apiGet<Income[]>("/income");
}

export function createIncome(body: IncomeInput): Promise<Income> {
  return apiPost<Income>("/income", body);
}

export function updateIncome(
  id: string,
  patch: Partial<IncomeInput>,
): Promise<Income> {
  return apiPatch<Income>(`/income/${id}`, patch);
}

export function deleteIncome(id: string): Promise<void> {
  return apiDelete(`/income/${id}`);
}

export interface Sleep {
  id: string;
  sleep_start: string;
  sleep_end: string;
  night_date: string;
  duration_minutes: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepInput {
  sleep_start: string;
  sleep_end: string;
  night_date?: string | null;
  note?: string | null;
}

export function listSleep(): Promise<Sleep[]> {
  return apiGet<Sleep[]>("/sleep");
}

export function createSleep(body: SleepInput): Promise<Sleep> {
  return apiPost<Sleep>("/sleep", body);
}

export function updateSleep(
  id: string,
  patch: Partial<SleepInput>,
): Promise<Sleep> {
  return apiPatch<Sleep>(`/sleep/${id}`, patch);
}

export function deleteSleep(id: string): Promise<void> {
  return apiDelete(`/sleep/${id}`);
}

export interface SleepGoal {
  goal_minutes: number;
}

export function getSleepGoal(): Promise<SleepGoal> {
  return apiGet<SleepGoal>("/settings/sleep-goal");
}

export function updateSleepGoal(goalMinutes: number): Promise<SleepGoal> {
  return apiPut<SleepGoal>("/settings/sleep-goal", { goal_minutes: goalMinutes });
}

export type HabitTrackingType = "binary" | "duration";

export interface Habit {
  id: string;
  name: string;
  tracking_type: HabitTrackingType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitInput {
  name: string;
  tracking_type: HabitTrackingType;
  is_active?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  entry_date: string;
  done: boolean | null;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitLogInput {
  done?: boolean;
  duration_minutes?: number;
  note?: string | null;
}

export interface HabitGridCell {
  date: string;
  done: boolean | null;
  duration_minutes: number | null;
  met: boolean;
}

export interface HabitGridRow {
  id: string;
  name: string;
  tracking_type: HabitTrackingType;
  cells: HabitGridCell[];
  streak_current: number;
  rate_pct: number;
}

export interface HabitsGrid {
  days: string[];
  habits: HabitGridRow[];
}

export function listHabits(active?: boolean): Promise<Habit[]> {
  return apiGet<Habit[]>(
    `/habits${qs({ active: active == null ? undefined : String(active) })}`,
  );
}

export function createHabit(body: HabitInput): Promise<Habit> {
  return apiPost<Habit>("/habits", body);
}

export function getHabit(id: string): Promise<Habit> {
  return apiGet<Habit>(`/habits/${id}`);
}

export function updateHabit(
  id: string,
  patch: Partial<HabitInput>,
): Promise<Habit> {
  return apiPatch<Habit>(`/habits/${id}`, patch);
}

export function deleteHabit(id: string): Promise<void> {
  return apiDelete(`/habits/${id}`);
}

export function upsertHabitLog(
  habitId: string,
  entryDate: string,
  body: HabitLogInput,
): Promise<HabitLog> {
  return apiPut<HabitLog>(`/habits/${habitId}/log/${entryDate}`, body);
}

export function deleteHabitLog(
  habitId: string,
  entryDate: string,
): Promise<void> {
  return apiDelete(`/habits/${habitId}/log/${entryDate}`);
}

export function getHabitsGrid(days = 14): Promise<HabitsGrid> {
  return apiGet<HabitsGrid>(`/habits/grid${qs({ days: String(days) })}`);
}

export interface ActivityUnit {
  key: string;
  label: string;
  decimal: boolean;
}

export interface ActivityType {
  id: string;
  name: string;
  units: string[];
  daily_goal: number | null;
  goal_unit: string | null;
  sort_order: number;
}

export interface ActivityTypeInput {
  name: string;
  units: string[];
  daily_goal?: number | null;
  goal_unit?: string | null;
  sort_order?: number;
}

export type ActivityTypePatch = Partial<ActivityTypeInput>;

export function listUnits(): Promise<ActivityUnit[]> {
  return apiGet<ActivityUnit[]>("/activity-types/units");
}

export function listActivityTypes(): Promise<ActivityType[]> {
  return apiGet<ActivityType[]>("/activity-types");
}

export function createActivityType(
  body: ActivityTypeInput,
): Promise<ActivityType> {
  return apiPost<ActivityType>("/activity-types", body);
}

export function updateActivityType(
  id: string,
  patch: ActivityTypePatch,
): Promise<ActivityType> {
  return apiPatch<ActivityType>(`/activity-types/${id}`, patch);
}

export function deleteActivityType(id: string): Promise<void> {
  return apiDelete(`/activity-types/${id}`);
}

export interface FitnessEntry {
  id: string;
  entry_date: string;
  activity_type_id: string;
  activity_type_name: string | null;
  values: Record<string, number>;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface FitnessEntryInput {
  activity_type_id: string;
  values: Record<string, number>;
  entry_date?: string;
  note?: string | null;
}

export type FitnessEntryPatch = Partial<FitnessEntryInput>;

export function listFitnessEntries(params?: {
  date_from?: string;
  date_to?: string;
  activity_type_id?: string;
}): Promise<FitnessEntry[]> {
  return apiGet<FitnessEntry[]>(`/fitness/entries${qs(params)}`);
}

export function createFitnessEntry(
  body: FitnessEntryInput,
): Promise<FitnessEntry> {
  return apiPost<FitnessEntry>("/fitness/entries", body);
}

export function getFitnessEntry(id: string): Promise<FitnessEntry> {
  return apiGet<FitnessEntry>(`/fitness/entries/${id}`);
}

export function updateFitnessEntry(
  id: string,
  patch: FitnessEntryPatch,
): Promise<FitnessEntry> {
  return apiPatch<FitnessEntry>(`/fitness/entries/${id}`, patch);
}

export function deleteFitnessEntry(id: string): Promise<void> {
  return apiDelete(`/fitness/entries/${id}`);
}

export interface FitnessSeriesPoint {
  date: string;
  total: number;
}

export interface FitnessGoalBlock {
  activity_type_id: string;
  name: string;
  unit: string;
  goal: number;
  today_total: number;
  days_met: number;
  streak: number;
  series: FitnessSeriesPoint[];
}

export interface FitnessRecentEntry {
  id: string;
  entry_date: string;
  activity_type_name: string | null;
  values: Record<string, number>;
  note: string | null;
}

export interface FitnessSummary {
  goals: FitnessGoalBlock[];
  recent: FitnessRecentEntry[];
  week_entry_count: number;
  type_count: number;
}

export function getFitnessSummary(days = 30): Promise<FitnessSummary> {
  return apiGet<FitnessSummary>(`/fitness/summary${qs({ days: String(days) })}`);
}

export interface Workplace {
  id: string;
  name: string;
  created_at: string;
  contact_count: number;
}

export interface WorkplaceInput {
  name: string;
}

export function listWorkplaces(): Promise<Workplace[]> {
  return apiGet<Workplace[]>("/workplaces");
}

export function createWorkplace(body: WorkplaceInput): Promise<Workplace> {
  return apiPost<Workplace>("/workplaces", body);
}

export function updateWorkplace(
  id: string,
  body: WorkplaceInput,
): Promise<Workplace> {
  return apiPatch<Workplace>(`/workplaces/${id}`, body);
}

export function deleteWorkplace(id: string): Promise<void> {
  return apiDelete(`/workplaces/${id}`);
}

export interface Contact {
  id: string;
  name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  description: string | null;
  sector_id: string;
  created_at: string;
  updated_at: string;
  last_note_date: string | null;
}

export interface ContactInput {
  name: string;
  sector_id: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  description?: string | null;
}

export type ContactPatchInput = Partial<ContactInput>;

export function listContacts(workplaceId?: string): Promise<Contact[]> {
  return apiGet<Contact[]>(`/contacts${qs({ workplace_id: workplaceId })}`);
}

export function createContact(body: ContactInput): Promise<Contact> {
  return apiPost<Contact>("/contacts", body);
}

export function getContact(id: string): Promise<Contact> {
  return apiGet<Contact>(`/contacts/${id}`);
}

export function updateContact(
  id: string,
  patch: ContactPatchInput,
): Promise<Contact> {
  return apiPatch<Contact>(`/contacts/${id}`, patch);
}

export function deleteContact(id: string): Promise<void> {
  return apiDelete(`/contacts/${id}`);
}

export interface ContactNote {
  id: string;
  contact_date: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  note: string;
  contact_date?: string;
}

export type NotePatchInput = Partial<NoteInput>;

export function listNotes(contactId: string): Promise<ContactNote[]> {
  return apiGet<ContactNote[]>(`/contacts/${contactId}/notes`);
}

export function createNote(
  contactId: string,
  body: NoteInput,
): Promise<ContactNote> {
  return apiPost<ContactNote>(`/contacts/${contactId}/notes`, body);
}

export function updateNote(
  contactId: string,
  noteId: string,
  patch: NotePatchInput,
): Promise<ContactNote> {
  return apiPatch<ContactNote>(`/contacts/${contactId}/notes/${noteId}`, patch);
}

export function deleteNote(contactId: string, noteId: string): Promise<void> {
  return apiDelete(`/contacts/${contactId}/notes/${noteId}`);
}

export interface DayExpense {
  id: string;
  amount: string;
  category: string;
  description: string | null;
}

export interface DayIncome {
  id: string;
  amount: string;
  kind: IncomeKind;
  source: string | null;
  note: string | null;
}

export interface DaySleep {
  id: string;
  sleep_start: string;
  sleep_end: string;
  duration_minutes: number;
  note: string | null;
}

export interface DayHabit {
  id: string;
  habit_id: string;
  name: string;
  tracking_type: HabitTrackingType;
  done: boolean | null;
  duration_minutes: number | null;
  note: string | null;
}

export interface DayFitness {
  id: string;
  activity_type_name: string;
  values: Record<string, number>;
  note: string | null;
}

export interface DayNote {
  id: string;
  colleague_name: string;
  note: string;
}

export interface DayView {
  date: string;
  expenses: DayExpense[];
  expenses_total: string;
  incomes: DayIncome[];
  income_total: string;
  sleep: DaySleep[];
  habits: DayHabit[];
  fitness: DayFitness[];
  notes: DayNote[];
}

export function getDay(date: string): Promise<DayView> {
  return apiGet<DayView>(`/day/${date}`);
}

export interface DashboardDay {
  date: string;
  expense: string;
  income: string;
}

export interface CategoryShare {
  category: string;
  amount: string;
  pct: number;
}

export interface DashboardRead {
  daily: DashboardDay[];
  expense_mean_30d: string;
  categories_month: CategoryShare[];
}

export function getDashboard(): Promise<DashboardRead> {
  return apiGet<DashboardRead>("/dashboard");
}
