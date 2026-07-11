import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Role,
} from '../src/infrastrucure/prisma/generated/client';
import { appConfig } from '../src/common/config/app.config';
import { hashPassword } from '../src/common/utils/password';

const prisma = new PrismaClient({
  adapter: new PrismaPg(appConfig.databaseUrl),
});

const users = [
  {
    fullName: 'Concert Wow Admin',
    email: 'admin@concert-wow.test',
    role: Role.ADMIN,
  },
  {
    fullName: 'Concert User 1',
    email: 'user1@concert-wow.test',
    role: Role.USER,
  },
  {
    fullName: 'Concert User 2',
    email: 'user2@concert-wow.test',
    role: Role.USER,
  },
  {
    fullName: 'Concert User 3',
    email: 'user3@concert-wow.test',
    role: Role.USER,
  },
  {
    fullName: 'Concert User 4',
    email: 'user4@concert-wow.test',
    role: Role.USER,
  },
  {
    fullName: 'Concert User 5',
    email: 'user5@concert-wow.test',
    role: Role.USER,
  },
];

async function main(): Promise<void> {
  const passwordHash = await hashPassword(appConfig.seedPassword);

  await prisma.$transaction(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { fullName: user.fullName, passwordHash, role: user.role },
        create: { ...user, passwordHash },
      }),
    ),
  );
}

async function bootstrap(): Promise<void> {
  let shouldExit = false;

  try {
    await main();
  } catch (error: unknown) {
    console.error(error);
    shouldExit = true;
  } finally {
    await prisma.$disconnect();
  }

  if (shouldExit) {
    process.exit(1);
  }
}

void bootstrap();
