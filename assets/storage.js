/* Keep the original localStorage keys and version-1 export format. */
(() => {
  'use strict';
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function validate(data, semesters, flexibleRequirements = []) {
    if (!record(data) || (data.version !== undefined && data.version !== 1) || !record(data.checked) || !record(data.cross)) throw new Error('Invalid plan');
    if (data.placements !== undefined && !record(data.placements)) throw new Error('Invalid placements');
    const ids = new Set(semesters.flatMap(s => s.elec.map(c => `${s.sem}::${c.n}`)));
    const sems = new Set(semesters.map(s => s.sem));
    const requirements = new Map(flexibleRequirements.map(requirement => [requirement.id, requirement]));
    const checked = {}, cross = {}, placements = {};
    for (const [id, value] of Object.entries(data.checked)) {
      if (typeof value !== 'boolean') throw new Error('Invalid selection');
      if (ids.has(id)) checked[id] = value;
    }
    for (const [sem, value] of Object.entries(data.cross)) {
      if (!Number.isInteger(value) || value < 0 || value > 20) throw new Error('Invalid credits');
      if (sems.has(sem)) cross[sem] = value;
    }
    for (const requirement of flexibleRequirements) placements[requirement.id] = requirement.defaultSem;
    for (const [id, sem] of Object.entries(data.placements || {})) {
      if (typeof sem !== 'string') throw new Error('Invalid placement');
      const requirement = requirements.get(id);
      if (requirement && !requirement.semesters.includes(sem)) throw new Error('Invalid placement');
      if (requirement) placements[id] = sem;
    }
    return { checked, cross, placements };
  }
  function load(semesters, flexibleRequirements = []) {
    try {
      return validate({ checked: JSON.parse(localStorage.getItem('ntut-roadmap-checked') || '{}'), cross: JSON.parse(localStorage.getItem('ntut-roadmap-cross') || '{}'), placements: JSON.parse(localStorage.getItem('ntut-roadmap-placements') || '{}') }, semesters, flexibleRequirements);
    } catch { return validate({ checked: {}, cross: {}, placements: {} }, semesters, flexibleRequirements); }
  }
  function save(state) {
    try {
      localStorage.setItem('ntut-roadmap-checked', JSON.stringify(state.checked));
      localStorage.setItem('ntut-roadmap-cross', JSON.stringify(state.cross));
      localStorage.setItem('ntut-roadmap-placements', JSON.stringify(state.placements));
      return true;
    } catch { return false; }
  }
  Roadmap.storage = { validate, load, save };
})();
