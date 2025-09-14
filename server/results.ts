import prisma from './lib/prisma';

export async function buildResultsForEvent(eventId: string) {
  const [event, boxes, guesses, ranks, users] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.box.findMany({ 
      where: { eventId }, 
      include: { place: true },
      orderBy: { number: 'asc' }
    }),
    prisma.guess.findMany({ 
      where: { user: { eventId } }, 
      include: { place: true, box: true, user: true } 
    }),
    prisma.rankingEntry.findMany({ 
      where: { user: { eventId } }, 
      include: { box: true, user: true } 
    }),
    prisma.user.findMany({ 
      where: { eventId },
      include: { guesses: true, rankings: true }
    }),
  ]);

  if (!event) throw new Error('Event not found');

  // Initialize data structures for each box
  const byBoxNum = new Map<number, { 
    number: number, 
    guessDist: Record<string, number>, 
    points: number, 
    rankCounts: Record<number, number>,
    revealedPlace?: string | null,
    correctGuesses: number,
  }>();

  for (const b of boxes) {
    byBoxNum.set(b.number, { 
      number: b.number, 
      guessDist: {}, 
      points: 0, 
      rankCounts: {1:0, 2:0, 3:0},
      revealedPlace: event.status === 'REVEALED' ? b.place?.name : null,
      correctGuesses: 0,
    });
  }

  // Count guesses per box per place
  for (const g of guesses) {
    const n = g.box.number;
    const k = g.place.name;
    const boxData = byBoxNum.get(n)!;
    boxData.guessDist[k] = (boxData.guessDist[k] || 0) + 1;
    
    // Count correct guesses if revealed
    if (event.status === 'REVEALED' && g.box.placeId === g.placeId) {
      boxData.correctGuesses++;
    }
  }

  // Calculate points from rankings
  const pts = (r: number) => r === 1 ? 3 : r === 2 ? 2 : 1;
  for (const r of ranks) {
    const n = r.box.number;
    const boxData = byBoxNum.get(n)!;
    boxData.points += pts(r.rank);
    boxData.rankCounts[r.rank] = (boxData.rankCounts[r.rank] || 0) + 1;
  }

  // Calculate user accuracy if revealed
  let userAccuracy: Record<string, { username: string, correct: number, total: number }> | undefined;
  if (event.status === 'REVEALED') {
    userAccuracy = {};
    for (const user of users) {
      const correctGuesses = guesses.filter((g: any) => 
        g.userId === user.id && g.box.placeId === g.placeId
      ).length;
      userAccuracy[user.id] = {
        username: user.username,
        correct: correctGuesses,
        total: user.guesses.length,
      };
    }
  }

  // Calculate user progress
  const userProgress = users.map((user: any) => ({
    userId: user.id,
    username: user.username,
    guessesCompleted: user.guesses.length,
    rankingCompleted: user.rankings.length === 3,
  }));

  return {
    eventStatus: event.status,
    boxes: Array.from(byBoxNum.values()).map(b => ({
      number: b.number,
      revealedPlace: b.revealedPlace,
      correctGuesses: event.status === 'REVEALED' ? b.correctGuesses : undefined,
    })),
    results: Array.from(byBoxNum.values()).sort((a,b) => b.points - a.points),
    userAccuracy: userAccuracy ? Object.values(userAccuracy).sort((a,b) => b.correct - a.correct) : undefined,
    userProgress,
  };
}
