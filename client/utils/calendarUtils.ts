import {Activity} from "react-activity-calendar";

const dateToString = (date: Date) => {
  const formattedDate = date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
  return formattedDate;
}

const getLevelByCount = (count: number) => {
  if (count === 0) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 7) return 3;
  else return 4;
}

export const commitHistoryToActivityCalendar = (contributionList: UserContribution[]) => {
  const today = new Date();
  const lastYearToday = new Date();
  lastYearToday.setFullYear(today.getFullYear() - 1);
  const activityCalendar: Activity[] = [];
  const datesToContributionCount: {[idx:string]: number} = {
    [dateToString(lastYearToday)]: 0,
    [dateToString(today)]: 0
  };
  contributionList.forEach((contribution) => {
    const date = new Date(contribution.createdat);
    const dateString = dateToString(date);
    if (datesToContributionCount[dateString] === undefined) {
      datesToContributionCount[dateString] = 0;
    } else {
      datesToContributionCount[dateString]++;
    }
  });

  Object.keys(datesToContributionCount).forEach((dateString) => {
    const activity: Activity = {
      date: dateString,
      count: datesToContributionCount[dateString],
      level: getLevelByCount(datesToContributionCount[dateString])
    };
    activityCalendar.push(activity);
  })

  activityCalendar.sort((a, b) => a.date.localeCompare(b.date));
  return activityCalendar;
}