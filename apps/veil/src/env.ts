import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_BASE_URL: z.preprocess(
    val => val ?? undefined,
    z.string().url().default('https://dex.penumbra.zone'),
  ),
  PENUMBRA_GRPC_ENDPOINT: z.string().url(),
  PENUMBRA_INDEXER_ENDPOINT: z.string().min(1),
  PENUMBRA_CHAIN_ID: z.string().min(1),
  PENUMBRA_CUILOA_URL: z.preprocess(
    val => val ?? undefined,
    z.string().url().default('https://cuiloa.testnet.penumbra.zone'),
  ),
  PENUMBRA_INDEXER_CA_CERT: z.string().optional(),
});

const processEnv = {
  NEXT_PUBLIC_BASE_URL: process.env['NEXT_PUBLIC_BASE_URL'],
  PENUMBRA_GRPC_ENDPOINT: process.env['PENUMBRA_GRPC_ENDPOINT'],
  PENUMBRA_INDEXER_ENDPOINT: process.env['PENUMBRA_INDEXER_ENDPOINT'],
  PENUMBRA_CHAIN_ID: process.env['PENUMBRA_CHAIN_ID'],
  PENUMBRA_CUILOA_URL: process.env['PENUMBRA_CUILOA_URL'],
  PENUMBRA_INDEXER_CA_CERT: process.env['PENUMBRA_INDEXER_CA_CERT'],
};

// Skip validation during build time (CI or local builds)
const isBuildTime =
  process.env['NODE_ENV'] === 'production' && !process.env['PENUMBRA_GRPC_ENDPOINT'];
const isNextJsBuild = process.env['NEXT_PHASE'] === 'phase-production-build';

let envData: z.infer<typeof schema>;

if (isBuildTime || isNextJsBuild) {
  // During build time, use unvalidated environment for type compatibility
  envData = processEnv as z.infer<typeof schema>;
} else {
  // Runtime validation
  const parsed = schema.safeParse(processEnv);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables. Aborting startup.');
    parsed.error.issues.forEach(issue => {
      const varName = issue.path[0] as keyof typeof processEnv;
      const value = processEnv[varName];

      let expected = 'a valid value';
      if (issue.code === 'invalid_type') {
        expected = `a ${issue.expected}`;
      } else if (issue.code === 'too_small') {
        expected = `at least ${issue.minimum} characters`;
      }

      console.error(`\n- Variable: ${varName}`);
      if (issue.code !== 'invalid_string') {
        console.error(`  - Expected: ${expected}`);
      }
      console.error(`  - Received: ${JSON.stringify(value)}`);
      console.error(`  - Issue: ${issue.message}`);
    });

    throw new Error('Invalid environment variables');
  }

  envData = parsed.data;
}

export const env = envData;
