import { db } from './client';
import { customers, bonusSettings, articles } from './schema';
import { eq } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';

// Typer
export type Customer = InferSelectModel<typeof customers>;
export type Article = InferSelectModel<typeof articles>;

/** --- ARTIKLAR (För Admin) --- **/

export const addArticle = async (sku: string, name: string, price: number, category: string) => {
  return await db.insert(articles).values({
    sku,
    name,
    price,
    category,
  });
};

export const updateArticle = async (id: number, sku: string, name: string, price: number, category: string) => {
  return await db.update(articles)
    .set({ sku, name, price, category })
    .where(eq(articles.id, id));
};

export const deleteArticle = async (id: number) => {
  return await db.delete(articles).where(eq(articles.id, id));
};

/** --- INSTÄLLNINGAR (För Admin) --- **/

export const saveSettings = async (threshold: number, reward: number, message: string) => {
  // Vi använder ID 1 för våra inställningar
  return await db.insert(bonusSettings)
    .values({
      id: 1,
      threshold,
      rewardAmount: reward,
      bonusMessage: message,
    })
    .onConflictDoUpdate({
      target: bonusSettings.id,
      set: { threshold, rewardAmount: reward, bonusMessage: message },
    });
};

/** --- KUNDER & KÖP (För Kassan) --- **/

export const getCustomer = async (phone: string): Promise<Customer | undefined> => {
  return await db.query.customers.findFirst({
    where: eq(customers.phoneNumber, phone),
  });
};

export const createCustomer = async (phone: string): Promise<Customer> => {
  const result = await db.insert(customers).values({
    phoneNumber: phone,
    currentBalance: 0,
    totalSpent: 0,
  }).returning();
  
  return result[0];
};

export const processPurchase = async (phone: string, amount: number, appliedBonusesCount: number = 0) => {
  const config = await db.query.bonusSettings.findFirst({ 
    where: eq(bonusSettings.id, 1) 
  });
  const threshold = config?.threshold ?? 1000;

  let customer = await getCustomer(phone);
  if (!customer) {
    customer = await createCustomer(phone);
  }

  const previousBalance = customer.currentBalance;
  
  let adjustedPreviousBalance = previousBalance;
  if (appliedBonusesCount > 0) {
    const deduction = threshold * appliedBonusesCount;
    adjustedPreviousBalance = Math.max(0, previousBalance - deduction);
  }

  const newBalance = adjustedPreviousBalance + amount;
  
  const previousBonuses = Math.floor(adjustedPreviousBalance / threshold);
  const newBonuses = Math.floor(newBalance / threshold);
  
  const bonusEarned = newBonuses > previousBonuses;

  await db.update(customers)
    .set({ 
      currentBalance: newBalance, 
      totalSpent: customer.totalSpent + amount 
    })
    .where(eq(customers.phoneNumber, phone));

  return { bonusEarned, newBalance, threshold };
};