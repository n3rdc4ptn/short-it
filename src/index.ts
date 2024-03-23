import { Hono } from 'hono';
import { UnkeyContext, unkey } from '@unkey/hono';

export type Env = {
	UNKEY_API_ID: string;
	DEFAULT_EXPIRATION: number;

	SHORT_IT: KVNamespace;
};

const app = new Hono<{ Bindings: Env; Variables: { unkey: UnkeyContext } }>();

app.get('/:slug', async (c) => {
	const { slug } = c.req.param();
	const url = await c.env.SHORT_IT.get(slug);

	if (url === null) {
		return new Response('Not Found', { status: 404 });
	}

	return Response.redirect(url, 307);
});

// Secured post endpoint
app.use(
	'/*',
	async (c, next) => {
		// if (c.req.method === 'GET') {
		// 	return next();
		// }

		const unkeyMiddleware = unkey({
			apiId: c.env.UNKEY_API_ID,
		});

		return unkeyMiddleware(c, next);
	},
	async (c, next) => {
		if (c.var.unkey.valid === false) {
			return new Response('Unauthorized', { status: 401 });
		}

		await next();
	}
);

app.get('/', async (c) => {
	const all = await c.env.SHORT_IT.list();

	const keys = all.keys.map((key) => key.name);

	return c.json(keys);
});

app.post('/', async (c) => {
	const url = await c.req.text();
	var slug = Math.random().toString(36).slice(2);

	// Check if duplicate
	while ((await c.env.SHORT_IT.get(slug)) !== null) {
		slug = Math.random().toString(36).slice(2);
	}

	await c.env.SHORT_IT.put(slug, url, {
		expirationTtl: c.env.DEFAULT_EXPIRATION,
		metadata: {
			owner: c.var.unkey.ownerId,
		},
	});

	c.status(201);
	return c.text(slug);
});

app.post('/:slug', async (c) => {
	const { slug } = c.req.param();
	const url = await c.req.text();

	await c.env.SHORT_IT.put(slug, url, {
		metadata: {
			owner: c.var.unkey.ownerId,
		},
	});

	c.status(201);
	return c.text('Created');
});

app.delete('/:slug', async (c) => {
	const { slug } = c.req.param();
	await c.env.SHORT_IT.delete(slug);

	return c.text('Deleted');
});

export default app;
