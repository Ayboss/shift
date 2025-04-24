exports.formatShitdata = (shifts, shiftTypes) => {
  const defaulttype = {};
  for (let type of shiftTypes) {
    defaulttype[type.name.toLowerCase()] = null;
  }

  const formatedshifts = {};

  for (let shift of shifts) {
    const shifttype = shift.type.toLowerCase();
    if (!(shifttype in defaulttype)) continue;

    if (!(shift.date in formatedshifts)) {
      formatedshifts[shift.date] = {
        date: shift.date,
        companyId: shift.companyId,
        staffId: shift.staffId,
        shiftype: { ...defaulttype },
      };
    }
    formatedshifts[shift.date]["shiftype"][shifttype] = {
      details: shift.details,
      type: shift.type,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
      id: shift.id,
    };
  }

  return Object.values(formatedshifts);
};
