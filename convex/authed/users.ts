// User management — syncs Firebase auth identity to the Convex users table.
//
// This file shows the pattern for user upsert:
// 1. Look up user by tokenIdentifier (stable across token refreshes)
// 2. Create if missing, update if fields changed
// 3. Return the Convex user document

import { authedMutation, authedQuery, runAuthedEffect } from './helpers';
import { Effect } from 'effect';

export const getOrCreateUser = authedMutation({
	args: {},
	handler: async (ctx) => runAuthedEffect(
		Effect.gen(function* () {
			yield* Effect.logInfo(`getOrCreateUser for: ${ctx.identity.email || 'unknown'}`);
            
			const { identity } = ctx;
			const tokenIdentifier = identity.tokenIdentifier;

			let viewer = yield* Effect.tryPromise(() => 
				ctx.db.query('users')
					.withIndex('by_token', (q) => q.eq('tokenIdentifier', tokenIdentifier))
					.unique()
			);

			if (viewer) {
				const updates: Record<string, string | undefined> = {};
				if (viewer.name !== (identity.name ?? '')) {
					updates.name = identity.name ?? '';
				}
				if (viewer.email !== (identity.email ?? '')) {
					updates.email = identity.email ?? '';
				}
				if (viewer.avatarUrl !== identity.pictureUrl) {
					updates.avatarUrl = identity.pictureUrl;
				}

				if (Object.keys(updates).length > 0) {
					yield* Effect.tryPromise(() => ctx.db.patch(viewer!._id, updates));
					viewer = (yield* Effect.tryPromise(() => ctx.db.get(viewer!._id)))!;
				}
			} else {
				const userId = yield* Effect.tryPromise(() => ctx.db.insert('users', {
					name: identity.name ?? '',
					email: identity.email ?? '',
					avatarUrl: identity.pictureUrl,
					tokenIdentifier
				}));
				viewer = (yield* Effect.tryPromise(() => ctx.db.get(userId)))!;
			}

			return viewer._id;
		})
	)
});

export const currentUser = authedQuery({
	args: {},
	handler: async (ctx) => runAuthedEffect(
		Effect.gen(function* () {
			return ctx.viewer;
		})
	)
});

