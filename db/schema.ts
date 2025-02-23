import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Database Schema

export const users = sqliteTable("Users", {
  userId: integer("user_id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const accounts = sqliteTable("Accounts", {
  accountId: integer("account_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  accountName: text("account_name").notNull(),
  accountType: text("account_type", {
    enum: ["checking", "savings", "credit_card", "cash", "investment"],
  }).notNull(), // ENUM emulation
  balance: real("balance").notNull().default(0.0),
  currency: text("currency").notNull().default("GHS"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const categories = sqliteTable("Categories", {
  categoryId: integer("category_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  categoryName: text("category_name").notNull(),
  isIncome: integer("is_income", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const transactions = sqliteTable("Transactions", {
  transactionId: integer("transaction_id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.accountId),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.categoryId),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  transactionType: text("transaction_type", {
    enum: ["debit", "credit", "transfer"],
  }).default("debit"), // ENUM emulation
  linkedTransactionId: integer("linked_transaction_id").references(
    () => transactions.transactionId
  ),
  budgetId: integer("budget_id").references(() => budgets.budgetId),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const savingsGoals = sqliteTable("SavingsGoals", {
  goalId: integer("goal_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  goalName: text("goal_name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0.0),
  targetDate: integer("target_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const savingsContributions = sqliteTable("SavingsContributions", {
  contributionId: integer("contribution_id").primaryKey({
    autoIncrement: true,
  }),
  goalId: integer("goal_id")
    .notNull()
    .references(() => savingsGoals.goalId),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.accountId),
  transactionId: integer("transaction_id").references(
    () => transactions.transactionId
  ),
  amount: real("amount").notNull(),
  contributionDate: integer("contribution_date", {
    mode: "timestamp",
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const budgets = sqliteTable("Budgets", {
  budgetId: integer("budget_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.categoryId),
  budgetName: text("budget_name").notNull(),
  budgetAmount: real("budget_amount").notNull(),
  periodType: text("period_type", {
    enum: ["monthly", "weekly", "bi-weekly", "yearly"],
  }).default("monthly"), // ENUM emulation
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  rollover: integer("rollover", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const budgetTracking = sqliteTable("BudgetTracking", {
  trackingId: integer("tracking_id").primaryKey({ autoIncrement: true }),
  budgetId: integer("budget_id")
    .notNull()
    .references(() => budgets.budgetId),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.transactionId),
  amount: real("amount").notNull(),
  trackingDate: integer("tracking_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

// Types
// Select Types
export type User = InferSelectModel<typeof users>;
// Insert Types
export type InsertUser = InferInsertModel<typeof users>;
export type Account = InferSelectModel<typeof accounts>;
export type InsertAccount = InferInsertModel<typeof accounts>;
export type Category = InferSelectModel<typeof categories>;
export type InsertCategory = InferInsertModel<typeof categories>;
export type Transaction = InferSelectModel<typeof transactions>;
export type InsertTransaction = InferInsertModel<typeof transactions>;
export type SavingsGoal = InferSelectModel<typeof savingsGoals>;
export type InsertSavingsGoal = InferInsertModel<typeof savingsGoals>;
export type Budget = InferSelectModel<typeof budgets>;
export type InsertBudget = InferInsertModel<typeof budgets>;
export type BudgetTracking = InferSelectModel<typeof budgetTracking>;
export type InsertBudgetTracking = InferInsertModel<typeof budgetTracking>;

export interface SchemaTypes {
  users: typeof users;
  accounts: typeof accounts;
  categories: typeof categories;
  transactions: typeof transactions;
  savingsGoals: typeof savingsGoals;
  budgets: typeof budgets;
  budgetTracking: typeof budgetTracking;
}

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  savingsGoals: many(savingsGoals),
  budgets: many(budgets),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.userId],
  }),
  transactions: many(transactions),
  savingsContributions: many(savingsContributions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.userId],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.accountId],
    }),
    category: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.categoryId],
    }),
    linkedTransaction: one(transactions, {
      fields: [transactions.linkedTransactionId],
      references: [transactions.transactionId],
    }),
    budget: one(budgets, {
      fields: [transactions.budgetId],
      references: [budgets.budgetId],
    }),
    budgetTracking: many(budgetTracking),
    savingsContributions: many(savingsContributions),
  })
);

export const savingsGoalsRelations = relations(
  savingsGoals,
  ({ one, many }) => ({
    user: one(users, {
      fields: [savingsGoals.userId],
      references: [users.userId],
    }),
    savingsContributions: many(savingsContributions),
  })
);

export const savingsContributionsRelations = relations(
  savingsContributions,
  ({ one }) => ({
    goal: one(savingsGoals, {
      fields: [savingsContributions.goalId],
      references: [savingsGoals.goalId],
    }),
    account: one(accounts, {
      fields: [savingsContributions.accountId],
      references: [accounts.accountId],
    }),
    transaction: one(transactions, {
      fields: [savingsContributions.transactionId],
      references: [transactions.transactionId],
    }),
  })
);

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.userId],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.categoryId],
  }),
  transactions: many(transactions),
  budgetTracking: many(budgetTracking),
}));

export const budgetTrackingRelations = relations(budgetTracking, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetTracking.budgetId],
    references: [budgets.budgetId],
  }),
  transaction: one(transactions, {
    fields: [budgetTracking.transactionId],
    references: [transactions.transactionId],
  }),
}));
