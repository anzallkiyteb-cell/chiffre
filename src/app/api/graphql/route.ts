import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import initDb from '@/lib/initDb';

// For Next.js App Router - increase body size limit
export const maxDuration = 60; // seconds
export const dynamic = 'force-dynamic';

// Initialize DB tables
initDb();

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: Request) {
    return handler(request);
}

export async function POST(request: Request) {
    return handler(request);
}
