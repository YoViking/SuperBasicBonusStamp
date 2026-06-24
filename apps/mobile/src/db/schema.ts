import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
    id: integer('id').primaryKey({ autoIncrement: true}),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    price: real('price').notNull(),
    category: text('category').notNull().default('Färgfilm'),
});

export const customers = sqliteTable('customers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    phoneNumber: text('phone_number').notNull().unique(),
    currentBalance: real('current_balance').default(0).notNull(),
    totalSpent: real('total_spent').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const bonusSettings = sqliteTable('bonus_settings', {
    id: integer('id').primaryKey(),
    threshold: real('threshold').notNull(),
    rewardAmount: real('reward_amount').notNull(),
    bonusMessage: text('bonus_message').notNull(),
})