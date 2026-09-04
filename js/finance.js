Bolao.Finance = {
  config: {
    entryFee: 100,
    finalAllocation: 50,
    playoffChampionAllocation: 10,
    regularChampionAllocation: 20,
    roundWinnersAllocation: 20,
    regularPrizeRounds: 18,
    playoffPrizeRounds: 3,
    totalPrizeRounds: 21,
    lastPlaceFine: 10
  },

  finalShares(participantCount) {
    if (participantCount <= 10) return [100, 0, 0];
    if (participantCount <= 20) return [90, 10, 0];
    return [80, 15, 5];
  },

  calculate(users) {
    const active = users.filter(user => user.active !== false);
    const paid = active.filter(user => user.paid === true);
    const participantCount = active.length;
    const paidCount = paid.length;
    const config = this.config;
    const finalShares = this.finalShares(participantCount);

    const totalExpected = participantCount * config.entryFee;
    const totalReceived = paidCount * config.entryFee;
    const finalPool = participantCount * config.finalAllocation;
    const playoffChampionPool = participantCount * config.playoffChampionAllocation;
    const regularChampionPool = participantCount * config.regularChampionAllocation;
    const roundWinnersPool = participantCount * config.roundWinnersAllocation;
    const roundPrize = config.totalPrizeRounds
      ? roundWinnersPool / config.totalPrizeRounds
      : 0;

    return {
      participants: participantCount,
      paid: paidCount,
      pending: participantCount - paidCount,
      totalExpected,
      totalReceived,
      finalPool,
      playoffChampionPool,
      regularChampionPool,
      roundWinnersPool,
      roundPrize,
      regularPrizeRounds: config.regularPrizeRounds,
      playoffPrizeRounds: config.playoffPrizeRounds,
      totalPrizeRounds: config.totalPrizeRounds,
      lastPlaceFine: participantCount ? config.lastPlaceFine : 0,
      finalShares,
      finalPrizes: finalShares.map(share => finalPool * share / 100),
      allocatedTotal: finalPool + playoffChampionPool + regularChampionPool + roundWinnersPool,
      balance: totalExpected - (finalPool + playoffChampionPool + regularChampionPool + roundWinnersPool)
    };
  },

  money(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
};
