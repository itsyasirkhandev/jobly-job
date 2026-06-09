import {
	customAction,
	customCtxAndArgs,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';
import { QueryCtx, MutationCtx } from '../_generated/server';
import { ConvexError } from 'convex/values';
import { Effect } from 'effect';

export async function runAuthedEffect<Result, Error>(
	effect: Effect.Effect<Result, Error, never>
): Promise<Result> {
	try {
		return await Effect.runPromise(effect);
	} catch (error) {
		if (error && typeof error === 'object' && '_tag' in error) {
			const taggedError = error as { _tag: string; [key: string]: unknown };
			throw new ConvexError({
				tag: taggedError._tag,
				data: taggedError as unknown as Record<string, string | number | boolean | null>
			});
		}
		throw error;
	}
}

const authQueryGuard = customCtxAndArgs({
	args: {},
	input: async (ctx: QueryCtx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new ConvexError({
				tag: 'UnauthorizedError',
				data: { message: 'Not authenticated' }
			});
		}

		const viewer = await ctx.db
			.query('users')
			.withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
			.unique();

		return { ctx: { ...ctx, identity, viewer }, args: {} };
	}
});

const authMutationGuard = customCtxAndArgs({
	args: {},
	input: async (ctx: MutationCtx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new ConvexError({
				tag: 'UnauthorizedError',
				data: { message: 'Not authenticated' }
			});
		}

		const viewer = await ctx.db
			.query('users')
			.withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
			.unique();

		return { ctx: { ...ctx, identity, viewer }, args: {} };
	}
});

const authActionGuard = customCtxAndArgs({
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new ConvexError({
				tag: 'UnauthorizedError',
				data: { message: 'Not authenticated' }
			});
		}

		return { ctx: { ...ctx, identity }, args: {} };
	}
});

export const authedQuery = customQuery(query, authQueryGuard);
export const authedMutation = customMutation(mutation, authMutationGuard);
export const authedAction = customAction(action, authActionGuard);



