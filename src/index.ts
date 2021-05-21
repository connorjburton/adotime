import inquirer from 'inquirer';
import axios from 'axios';
import { default as userConfig } from './config.json';
import Constants from './constants';

interface Answers extends inquirer.Answers {
    URL: string;
    PAT: string;
}

const calcTimeDifference = ([startHours, startMinutes]: number[], [endHours, endMinutes]: number[]): number => {
    const before: Date = new Date();
    before.setHours(startHours)
    before.setMinutes(startMinutes);
    before.setSeconds(0);
    before.setMilliseconds(0);

    const after: Date = new Date(before.getTime());
    after.setHours(endHours);
    after.setMinutes(endMinutes);

    return (((after.getTime() - before.getTime())/1000)/60)/60;
}

const toBase64 = (pat: string): string => {
    const buff: Buffer = Buffer.from(pat, 'utf-8');
    return buff.toString('base64');
}

async function init(): Promise<any> {
    const answers: inquirer.Answers = await inquirer.prompt([
        { name: 'URL', message: 'What is your ADO URL?', when: () => typeof userConfig.URL !== 'string' || userConfig.URL.length === 0 },
        { name: 'PAT', message: 'What is your PAT?', when: () => typeof userConfig.PAT !== 'string' || userConfig.PAT.length === 0 },
        { name: 'wi', message: 'WI number?' },
        { name: 'start', message: 'Start time?' },
        { name: 'end', message: 'End time?' },
    ]);
    const mergedAnswers: Answers = { ...userConfig, ...answers };

    axios.defaults.baseURL = userConfig.URL;
    axios.defaults.headers.common.Authorization = `Basic ${toBase64(`:${userConfig.PAT}`)}`;

    try {
        await axios.patch(
            `wit/workitems/${mergedAnswers.wi}?api-version=${Constants.ADO.VERSION}`,
            [{
                op: 'replace',
                path: `/fields/${Constants.ADO.FIELDS.COMPLETED}`,
                value: calcTimeDifference(
                    [parseInt(mergedAnswers.start.slice(0, 1), 10), parseInt(mergedAnswers.start.slice(2, 3), 10)],
                    [parseInt(mergedAnswers.end.slice(0, 1), 10), parseInt(mergedAnswers.end.slice(2, 3), 10)]
                )
            }],
            {
                headers: {
                    'Content-Type': 'application/json-patch+json'
                }
            }
        );
    } catch (err) {
        throw new Error(err);
    }
}

init();
