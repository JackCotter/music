import {Activity} from "react-activity-calendar";

const dateToString = (date: Date) => {
  const formattedDate = date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
  return formattedDate;
}

export const commitHistoryToActivityCalendar = (contributionList: UserContribution[]) => {
  const today = new Date();
  const lastYearToday = new Date();
  lastYearToday.setFullYear(today.getFullYear() - 1);
  const activityCalendar: Activity[] = [{date: dateToString(lastYearToday), count: 0, level: 0}, {date: dateToString(today), count: 0, level: 0}];
  const datesAdded: {[idx:string]: boolean} = {};
  contributionList.forEach((contribution) => {
    const date = new Date(contribution.createdat);
    const dateString = dateToString(date);
    
    // const date = new Date(dateString.replace(' ', 'T'));
    if (datesAdded[dateString]) {
      activityCalendar.find((activity) => activity.date === dateString)!.count++;
    } else {
      activityCalendar.push({date: dateString, count: 1, level: 1});
      datesAdded[dateString] = true;
    }
  });
  return activityCalendar;
}