import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create places
  const placeNames = [
    'Popeyes',
    'Jollibee',
    'The Bird',
    'Proposition Chicken',
    'KFC',
    'Starbird'
  ];

  console.log('Creating places...');
  for (const name of placeNames) {
    await prisma.place.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
