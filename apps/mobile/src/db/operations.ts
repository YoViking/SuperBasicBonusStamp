import { db } from './client';
import { customers, bonusSettings, articles } from './schema';
import { eq } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';

// Typer
export type Customer = InferSelectModel<typeof customers>;
export type Article = InferSelectModel<typeof articles>;

/** --- ARTIKLAR (För Admin) --- **/

export const addArticle = async (sku: string, name: string, price: number) => {
  return await db.insert(articles).values({
    sku,
    name,
    price,
  });
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

export const processPurchase = async (phone: string, amount: number) => {
  const config = await db.query.bonusSettings.findFirst({ 
    where: eq(bonusSettings.id, 1) 
  });
  const threshold = config?.threshold ?? 1000;

  let customer = await getCustomer(phone);
  if (!customer) {
    customer = await createCustomer(phone);
  }

  let newBalance = customer.currentBalance + amount;
  let bonusEarned = false;

  if (newBalance >= threshold) {
    bonusEarned = true;
    newBalance = newBalance - threshold;
  }

  await db.update(customers)
    .set({ 
      currentBalance: newBalance, 
      totalSpent: customer.totalSpent + amount 
    })
    .where(eq(customers.phoneNumber, phone));

  return { bonusEarned, newBalance, threshold };
};