import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import useDB from "./useDB";
import { savingsGoals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface SavingsGoal {
  goalId: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
}

interface UseSavingsGoalsOptions {
  limit?: number;
}

export function useSavingsGoals(options: UseSavingsGoalsOptions = {}) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const db = useDB();

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    try {
      const goals = await db
        .select()
        .from(savingsGoals)
        .where(eq(savingsGoals.userId, user.userId))
        .limit(options.limit || 50);

      setGoals(
        goals.map((goal) => {
          const timestamp = goal.targetDate;
          return {
            goalId: goal.goalId,
            goalName: goal.goalName,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: timestamp && typeof timestamp === 'number'
              ? new Date(timestamp * 1000) 
              : undefined,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching savings goals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, options.limit]);

  const addGoal = useCallback(
    async (newGoal: {
      goalName: string;
      targetAmount: number;
      targetDate?: Date;
    }) => {
      if (!user) return;

      try {
        const [insertedGoal] = await db
          .insert(savingsGoals)
          .values({
            userId: user.userId,
            goalName: newGoal.goalName,
            targetAmount: newGoal.targetAmount,
            currentAmount: 0,
            targetDate: newGoal.targetDate 
              ? sql`strftime('%s', ${newGoal.targetDate.toISOString()})` 
              : null,
          })
          .returning();

        if (insertedGoal) {
          const timestamp = insertedGoal.targetDate;
          setGoals((prev) => [
            ...prev,
            {
              goalId: insertedGoal.goalId,
              goalName: insertedGoal.goalName,
              targetAmount: insertedGoal.targetAmount,
              currentAmount: insertedGoal.currentAmount,
              targetDate: timestamp && typeof timestamp === 'number'
                ? new Date(timestamp * 1000) 
                : undefined,
            },
          ]);
        }
      } catch (error) {
        console.error("Error adding savings goal:", error);
        throw error;
      }
    },
    [user]
  );

  const updateGoalAmount = useCallback(
    async (goalId: number, newAmount: number) => {
      if (!user) return;

      try {
        const [updatedGoal] = await db
          .update(savingsGoals)
          .set({
            currentAmount: newAmount,
            updatedAt: sql`strftime('%s', 'now')`,
          })
          .where(eq(savingsGoals.goalId, goalId))
          .returning();

        if (updatedGoal) {
          setGoals((prev) =>
            prev.map((goal) =>
              goal.goalId === goalId
                ? {
                    ...goal,
                    currentAmount: updatedGoal.currentAmount,
                  }
                : goal
            )
          );
        }
      } catch (error) {
        console.error("Error updating savings goal amount:", error);
        throw error;
      }
    },
    [user]
  );

  return {
    goals,
    isLoading,
    fetchGoals,
    addGoal,
    updateGoalAmount,
  };
}
