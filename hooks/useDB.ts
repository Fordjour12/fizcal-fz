import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

const sqlite = useSQLiteContext();
const db = drizzle(sqlite, { schema });


export { db };

