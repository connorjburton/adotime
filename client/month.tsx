import React, { useState } from 'react';

import { months } from './constants';

interface Props {
    month: number;
    children: React.ReactNode;
}

export default function Month({ month, children }: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={'month'} onClick={() => setExpanded(!expanded)}>
            {months[month]}
            {expanded ? children : null}
        </div>
    )
}