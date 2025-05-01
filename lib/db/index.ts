// import { neon, neonConfig } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/singlestore";
// neonConfig.fetchConnectionCache = true;

// if (!process.env.DATABASE_URl) {
//   throw new Error("database url not found");
// }

// const sql = neon(process.env.DATABASE_URL as string);

// export const db = drizzle(sql);

// Local postgreSQL for local usage

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
