/* Pure helpers for per-student term reports and skill-progress summaries. */
(function(root){
  'use strict';

  function summarizeBulletin(options){
    const data = options || {};
    const studentId = String(data.studentId || '');
    const exams = Array.isArray(data.exams) ? data.exams : [];
    const gradeRecords = data.gradeRecords || {};
    const competencies = Array.isArray(data.competencies) ? data.competencies : [];
    const competencyStatus = data.competencyStatus || {};
    const attendance = Array.isArray(data.attendance) ? data.attendance : [];

    const grades = exams.map(exam => {
      const value = ((gradeRecords[exam.id] || {})[studentId]) || {};
      const maximum = Number(exam.bareme) || 20;
      const score = Number(value.n);
      const hasScore = !value.abs && value.n !== undefined && value.n !== null && value.n !== '' && Number.isFinite(score);
      return {
        id:exam.id,
        titre:exam.titre || 'Épreuve',
        date:exam.date || '',
        type:exam.type || '',
        bareme:maximum,
        note:hasScore ? score : null,
        absent:!!value.abs,
        sur20:hasScore && maximum > 0 ? score / maximum * 20 : null
      };
    });
    const markedGrades = grades.filter(grade => grade.sur20 !== null);
    const average = markedGrades.length ? markedGrades.reduce((sum,grade) => sum + grade.sur20,0) / markedGrades.length : null;

    const presence = { pointages:0, presents:0, absences:0, retards:0, exclus:0, sorties:0, billets:0 };
    attendance.forEach(entry => {
      const status = typeof entry === 'string' ? entry : entry && entry.status;
      if (!status) return;
      presence.pointages++;
      if (status === 'p') presence.presents++;
      else if (status === 'a') presence.absences++;
      else if (status === 'r') presence.retards++;
      else if (status === 'e') presence.exclus++;
      else if (status === 's') presence.sorties++;
      else if (status === 'b') presence.billets++;
    });

    const skills = competencies.map(competency => ({
      code:String(competency.code || ''),
      domaine:String(competency.domaine || ''),
      titre:String(competency.t || competency.titre || competency.code || 'Compétence'),
      status:['acquis','en-cours','renforcer'].includes(competencyStatus[competency.code]) ? competencyStatus[competency.code] : ''
    }));
    const skillCounts = { acquis:0, 'en-cours':0, renforcer:0, nonEvalues:0 };
    skills.forEach(skill => { if (skill.status) skillCounts[skill.status]++; else skillCounts.nonEvalues++; });

    return { grades, average, gradeCount:markedGrades.length, presence, skills, skillCounts };
  }

  const api = Object.freeze({ summarizeBulletin });
  root.STI_STUDENT_REPORTS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
