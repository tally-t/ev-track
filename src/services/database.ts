import { ExpenseLog } from '../types';

const STORAGE_KEY = 'ev_expenses';

function load(): ExpenseLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(expenses: ExpenseLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export async function addExpense(expense: Omit<ExpenseLog, 'id'>): Promise<number> {
  const expenses = load();
  const id = Date.now();
  expenses.unshift({ ...expense, id });
  save(expenses);
  return id;
}

export async function getAllExpenses(): Promise<ExpenseLog[]> {
  return load();
}

export async function deleteExpense(id: number): Promise<void> {
  save(load().filter((e) => e.id !== id));
}

export async function getExpenseSummary() {
  const expenses = load();
  return {
    totalCost: expenses.reduce((s, e) => s + e.totalCost, 0),
    totalKwh: expenses.reduce((s, e) => s + e.kwhCharged, 0),
    sessionCount: expenses.length,
  };
}
