/* Keep the original localStorage keys and version-1 export format. */
(() => {
  'use strict';
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function validate(data, semesters) {
    if (!record(data) || (data.version !== undefined && data.version !== 1) || !record(data.checked) || !record(data.cross)) throw new Error('Invalid plan');
    const ids = new Set(semesters.flatMap(s => s.elec.map(c => `${s.sem}::${c.n}`)));
    const sems = new Set(semesters.map(s => s.sem));
    const checked = {}, cross = {};
    for (const [id, value] of Object.entries(data.checked)) {
      if (typeof value !== 'boolean') throw new Error('Invalid selection');
      if (ids.has(id)) checked[id] = value;
    }
    for (const [sem, value] of Object.entries(data.cross)) {
      if (!Number.isInteger(value) || value < 0 || value > 20) throw new Error('Invalid credits');
      if (sems.has(sem)) cross[sem] = value;
    }
    return { checked, cross };
  }
  function load(semesters) {
    try {
      return validate({ checked: JSON.parse(localStorage.getItem('ntut-roadmap-checked') || '{}'), cross: JSON.parse(localStorage.getItem('ntut-roadmap-cross') || '{}') }, semesters);
    } catch { return { checked: {}, cross: {} }; }
  }
  function save(state) {
    try {
      localStorage.setItem('ntut-roadmap-checked', JSON.stringify(state.checked));
      localStorage.setItem('ntut-roadmap-cross', JSON.stringify(state.cross));
      return true;
    } catch { return false; }
  }
  Roadmap.storage = { validate, load, save };
})();
