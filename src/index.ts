import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { Hono } from 'hono';
import * as schema from './db/schema';

export type Env = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(async (c, next) => {
	const databaseUrl = c.env.DATABASE_URL;
	const sql = neon(databaseUrl);
	const db = drizzle(sql, { schema });
	(c.set as (key: string, value: unknown) => void)('db', db);
	await next();
});

app.get('/', async (c, next) => {
	const db = c.get('db') as NeonHttpDatabase<typeof schema>;
	const usersData = await db
		.select({
			uuid: schema.users.id,
			name: schema.users.name,
			email: schema.users.email,
		})
		.from(schema.users);
	return c.json({ usersData });
});

export default app;
