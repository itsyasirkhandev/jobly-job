import { Context, Effect, Layer, Config } from 'effect';

export class ServerConfig extends Context.Service<
	ServerConfig,
	{
		readonly convexPrivateBridgeKey: string;
	}
>()('ServerConfig') {
	static readonly layer = Layer.effect(
		ServerConfig,
		Effect.gen(function* () {
			const convexPrivateBridgeKey = yield* Config.string('CONVEX_PRIVATE_BRIDGE_KEY');
			return { convexPrivateBridgeKey };
		})
	);
}
