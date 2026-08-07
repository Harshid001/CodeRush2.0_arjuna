import { Provider } from "../x402/types";
import { registry } from "../x402/registry";

export const INITIAL_PROVIDERS: Provider[] = registry.getAllProviders();
