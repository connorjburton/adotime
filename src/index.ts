import inquirer from 'inquirer';
import axios, { AxiosInstance } from 'axios';

import { default as userConfig } from './config.json';
import Constants from './constants';
import WorkItem, { JsonPatch } from './workItem';

interface Answers extends inquirer.Answers {
    URL: string;
    PAT: string;
}

const calcTimeDiff = ([startHours, startMinutes]: number[], [endHours, endMinutes]: number[]): number => {
    const before: Date = new Date();
    before.setHours(startHours)
    before.setMinutes(startMinutes);
    before.setSeconds(0);
    before.setMilliseconds(0);

    const after: Date = new Date(before.getTime());
    after.setHours(endHours);
    after.setMinutes(endMinutes);

    const milliDiff = after.getTime() - before.getTime();
    return fixedFloat((((milliDiff/1000)/60)/60));
}

const fixedFloat = (num: number, fix: number = 2): number => {
    return parseFloat(num.toFixed(fix));
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
    const request: AxiosInstance = axios.create({
        baseURL: userConfig.URL,
        headers: {
            Authorization: `Basic ${toBase64(`:${userConfig.PAT}`)}`
        },
        params: {
            'api-version': Constants.ADO.VERSION
        }
    })

    const wi = new WorkItem(answers.wi, request);

    try {
        const details = await wi.get();
        const diff = calcTimeDiff(
            [parseInt(mergedAnswers.start.slice(0, 2), 10), parseInt(mergedAnswers.start.slice(2, 4), 10)],
            [parseInt(mergedAnswers.end.slice(0, 2), 10), parseInt(mergedAnswers.end.slice(2, 4), 10)]
        );

        const ops: JsonPatch[] = [];
        const remaining = details.fields[Constants.ADO.FIELDS.REMAINING];
        if (typeof remaining === 'number' && !Number.isNaN(remaining)) {
            ops.push({
                op: 'replace',
                path: `/fields/${Constants.ADO.FIELDS.REMAINING}`,
                value: Math.max(0, fixedFloat(remaining - diff))
            });
        }

        if (ops.length > 0) {
            await wi.update([
                ...ops,
                {
                    op: 'replace',
                    path: `/fields/${Constants.ADO.FIELDS.COMPLETED}`,
                    value: fixedFloat((details.fields[Constants.ADO.FIELDS.COMPLETED] || 0) + diff)
                }
            ]);
        }
    } catch (err) {
        throw new Error(err);
    }
}

init();
