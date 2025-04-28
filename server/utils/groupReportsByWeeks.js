function groupReportsByWeeks(reports) {
    const grouped = [];
    let groupIndex = 0;
    let currentGroup = { groupIndex: groupIndex, weeks: [], reports: [], requiredHours: 0 };
  
    for (const report of reports) {
      currentGroup.weeks.push(report.week);
      currentGroup.reports.push(report);
  
      if (report.hours !== undefined) {
        currentGroup.requiredHours += report.hours;
      }
  
      // If group reaches 4 weeks, push and reset
      if (currentGroup.weeks.length === 4) {
        grouped.push(currentGroup);
        groupIndex++;
        currentGroup = { groupIndex: groupIndex, weeks: [], reports: [], requiredHours: 0 };
      }
    }
  
    // Handle remaining reports if needed (example: last group not complete but requiredHours=0)
    if (currentGroup.weeks.length > 0) {
      grouped.push(currentGroup);
    }
  
    return grouped;
  }
  
  module.exports = groupReportsByWeeks;