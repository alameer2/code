import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

let db: any;

if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });
  db = drizzle({ client: pool });
} else {
  db = null;
}

export { db };
