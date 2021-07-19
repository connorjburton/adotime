import React from 'react';

import { Day } from './app';

interface Props {
    day: Day
}

const formatter = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function DayLink({ day }: Props) {
    console.log('test2');
    const date = new Date(Date.UTC(day.year, day.month, day.day));
    const formatted = formatter.format(date);
    return <span>{formatted}</span>;
}
