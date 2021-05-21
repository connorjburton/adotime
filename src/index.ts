import inquirer from 'inquirer';
import axios from 'axios';
import { default as userConfig } from './config.json';
import Constants from './constants';

interface Answers extends inquirer.Answers {
    URL: string;
    PAT: string;
}

const calcTimeDiff = ([startHours, startMinutes]: number[], [endHours, endMinutes]: number[]): string => {
    const before: Date = new Date();
    before.setHours(startHours)
    before.setMinutes(startMinutes);
    before.setSeconds(0);
    before.setMilliseconds(0);

    const after: Date = new Date(before.getTime());
    after.setHours(endHours);
    after.setMinutes(endMinutes);

    const milliDiff = after.getTime() - before.getTime();
    return (((milliDiff/1000)/60)/60).toFixed(2);
}

const toBase64 = (str: string): string => {
    const buff: Buffer = Buffer.from(str, 'utf-8');
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
                value: calcTimeDiff(
                    [parseInt(mergedAnswers.start.slice(0, 2), 10), parseInt(mergedAnswers.start.slice(2, 4), 10)],
                    [parseInt(mergedAnswers.end.slice(0, 2), 10), parseInt(mergedAnswers.end.slice(2, 4), 10)]
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
