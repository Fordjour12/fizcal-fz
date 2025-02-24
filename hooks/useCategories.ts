import { useState, useCallback, useEffect, useRef } from "react";
import useDB from "@/hooks/useDB";
import { useAuth } from "./useAuth";
import { eq } from "drizzle-orm";
import { categories, type Category } from "@/db/schema";

/**
 * useCategories Hook
 * Manages category data and operations for the application
 *
 * Features:
 * - Fetches categories from the database
 * - Provides CRUD operations for categories
 * - Handles loading and error states
 *
 * @returns {Object} Category data and operations
 */
export function useCategories() {
	const [categoriesList, setCategoriesList] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const db = useDB();
	const { user } = useAuth();

	const dbRef = useRef(db);
	const userRef = useRef(user);

	useEffect(() => {
		dbRef.current = db;
		userRef.current = user;
	}, [db, user]);

	const fetchCategories = useCallback(async () => {
		if (!userRef.current) {
			setError(new Error("No user logged in"));
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);

			const result = await dbRef.current
				.select()
				.from(categories)
				.where(eq(categories.userId, userRef.current.userId))
				.orderBy(categories.categoryName);

			setCategoriesList(result);
		} catch (err) {
			console.error("Error fetching categories:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to fetch categories"),
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const createCategory = useCallback(
		async (categoryName: string, isIncome = false) => {
			try {
				if (!userRef.current) throw new Error("No user logged in");

				await dbRef.current.insert(categories).values({
					userId: userRef.current.userId,
					categoryName,
					isIncome,
				});
				await fetchCategories();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to create category");
			}
		},
		[fetchCategories],
	);

	const updateCategory = useCallback(
		async (
			categoryId: number,
			updates: Partial<Omit<Category, "categoryId" | "userId">>,
		) => {
			try {
				await dbRef.current
					.update(categories)
					.set(updates)
					.where(eq(categories.categoryId, categoryId));
				await fetchCategories();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to update category");
			}
		},
		[fetchCategories],
	);

	const deleteCategory = useCallback(
		async (categoryId: number) => {
			try {
				await dbRef.current
					.delete(categories)
					.where(eq(categories.categoryId, categoryId));
				await fetchCategories();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to delete category");
			}
		},
		[fetchCategories],
	);

	return {
		categories: categoriesList,
		isLoading,
		error,
		refresh: fetchCategories,
		createCategory,
		updateCategory,
		deleteCategory,
	};
}
