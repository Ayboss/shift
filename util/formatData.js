exports.formatShitdata = (shifts, shiftTypes) => {
  const formatedshifts = {};

  for (let shift of shifts) {
    if (shift.date in formatedshifts) {
      formatedshifts[shift.date]["shiftype"].push({
        details: shift.details,
        type: shift.type,
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
        id: shift.id,
      });
      continue;
    }
    formatedshifts[shift.date] = {
      date: shift.date,
      companyId: shift.companyId,
      staffId: shift.staffId,
      shiftype: [
        {
          details: shift.details,
          type: shift.type,
          createdAt: shift.createdAt,
          updatedAt: shift.updatedAt,
          id: shift.id,
        },
      ],
    };
  }

  return Object.values(formatedshifts);
};
