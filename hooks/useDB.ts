import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

function useDB() {
  const db = useSQLiteContext();
  const drizzleDB = drizzle(db, { schema });

  return drizzleDB;
}

export default useDB;
