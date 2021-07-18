import React, { useState } from "react";

import Month from './month';
import DayLink from './dayLink';

const testData = [
    { year: 2021, month: 2, day: 1 },
    { year: 2021, month: 6, day: 17 },
    { year: 2020, month: 11, day: 27 }
];

export interface Day {
    year: number;
    month: number;
    day: number;
}

interface Month {
    year: number;
    month: number;
    days: Day[]
}

function daysToMonths(days: Day[]): Month[] {
    return days.reduce<Month[]>((agg, day) => {
        let monthIdx = agg.findIndex((month) => month.month === day.month && month.year === day.year);
        if (monthIdx === -1) {
            monthIdx = agg.length;
            agg.push({ year: day.year, month: day.month, days: [] });
        }

        agg[monthIdx].days.push(day);
        return agg;
    }, []);
}

export default function App() {
    const [days] = useState(testData);

    return (
        <div>
            <div className={'sidebar'}>
                {daysToMonths(days).map((month) => {
                    return <Month key={`${month.year}${month.month}`} month={month.month}>
                        {month.days.map((day) => <DayLink key={`${month.year}${month.month}${day.day}`} day={day} />)}
                    </Month>
                })}
            </div>
        </div>
    )
}