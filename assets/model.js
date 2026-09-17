/* Pure calculations shared by the history, credit summary and planner. */
(() => {
  'use strict';
  const earned = c => c.score === 'P' || (typeof c.score === 'number' && c.score >= 60) ? c.credits : 0;
  function completed(history) {
    const result = { total: 0, buckets: { gened: 0, major: 0, elec: 0, free: 0 }, withdrawn: 0, zeroCredit: 0 };
    for (const semester of history) for (const c of semester.courses) {
      const credits = earned(c);
      result.total += credits;
      result.buckets[c.bucket] += credits;
      if (c.score === 'W') result.withdrawn++;
      if (c.credits === 0 && (c.score === 'P' || typeof c.score === 'number' && c.score >= 60)) result.zeroCredit++;
    }
    return result;
  }
  const electiveCredits = (semester, state) => semester.elec.reduce((sum, c) => sum + (state.checked[`${semester.sem}::${c.n}`] ? c.cr : 0), 0);
  const requirementSemester = (requirement, state) => state.placements?.[requirement.id] || requirement.defaultSem;
  const flexibleCredits = (semester, flexibleRequirements, state) => flexibleRequirements.reduce((sum, requirement) => sum + (requirementSemester(requirement, state) === semester.sem ? requirement.cr : 0), 0);
  function project(history, semesters, state, targets, flexibleRequirements = []) {
    const current = completed(history), buckets = { ...current.buckets };
    for (const semester of semesters) {
      for (const c of semester.req) buckets[c.b === '△' ? 'gened' : 'major'] += c.cr;
      buckets.elec += electiveCredits(semester, state);
      buckets.free += state.cross[semester.sem] || 0;
    }
    for (const requirement of flexibleRequirements) buckets[requirement.b === '△' ? 'gened' : 'major'] += requirement.cr;
    const overflow = Math.max(0, buckets.elec - targets.elec);
    buckets.elec -= overflow;
    buckets.free += overflow;
    const total = Object.values(buckets).reduce((a,b) => a+b, 0);
    return { buckets, total, planned: total - current.total, overflow, categoriesEnough: Object.keys(targets).every(id => buckets[id] >= targets[id]) };
  }
  Roadmap.model = { earned, completed, electiveCredits, requirementSemester, flexibleCredits, project };
})();
