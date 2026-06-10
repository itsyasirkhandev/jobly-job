import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()),
		tokenIdentifier: v.string(),
		clerkId: v.optional(v.string())
	})
		.index('by_token', ['tokenIdentifier'])
		.index('by_clerk_id', ['clerkId']),

	numbers: defineTable({
		value: v.number()
	})
});
