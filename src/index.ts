import inquirer from 'inquirer';
import axios, { AxiosInstance } from 'axios';

import Constants from './constants';
import WorkItem, { JsonPatch, GetResponse } from './workItem';
import Config, { ConfigFile } from './config';

interface Answers extends inquirer.Answers {
    URL: string;
    PAT: string;
}

function is24Hr(value: string): boolean | string  {
    const err: string = 'The value provided is not a 24 hour value';
    if (value.length !== 4) {
        return err;
    }

    const parsedVal: number = parseInt(value, 10);
    if (Number.isNaN(parsedVal) || parsedVal < 0 || parsedVal > 2359) {
        return err;
    }

    return true;
}

function calcTimeDiff([startHours, startMinutes]: number[], [endHours, endMinutes]: number[]): number {
    const before: Date = new Date();
    before.setHours(startHours)
    before.setMinutes(startMinutes);
    before.setSeconds(0);
    before.setMilliseconds(0);

    const after: Date = new Date(before.getTime());
    after.setHours(endHours);
    after.setMinutes(endMinutes);

    const milliDiff: number = after.getTime() - before.getTime();
    return fixedFloat((((milliDiff/1000)/60)/60));
}

function fixedFloat(num: number, fix: number = 2): number {
    return parseFloat(num.toFixed(fix));
}

function toBase64(str: string): string {
    const buff: Buffer = Buffer.from(str, 'utf-8');
    return buff.toString('base64');
}

async function init(): Promise<any> {
    const configInstance: Config = new Config();
    const answers: inquirer.Answers = await inquirer.prompt([
        {
            name: 'URL',
            message: 'What is your ADO URL?',
            when: async (): Promise<boolean> => {
                const url: string = await configInstance.get('URL');
                return typeof url !== 'string' || url.length === 0;
            },
            filter: async (input: string): Promise<void> => {
                return await configInstance.set('URL', input);
            }
        },
        {
            name: 'PAT',
            message: 'What is your PAT?',
            when: async (): Promise<boolean> => {
                const pat: string = await configInstance.get('PAT');
                return typeof pat !== 'string' || pat.length === 0;
            },
            filter: async (input: string): Promise<void> => {
                return await configInstance.set('PAT', input);
            },
        },
        { name: 'wi', message: 'WI number?' },
        { name: 'start', message: 'Start time?', validate: is24Hr },
        { name: 'end', message: 'End time?', validate: is24Hr },
    ]);
    const mergedAnswers: Answers = { ...userConfig, ...answers };
    const request: AxiosInstance = axios.create({
        baseURL: mergedAnswers.URL,
        headers: {
            Authorization: `Basic ${toBase64(`:${mergedAnswers.PAT}`)}`
        },
        params: {
            'api-version': Constants.ADO.VERSION
        }
    })

    const wi: WorkItem = new WorkItem(answers.wi, request);

    try {
        const details: GetResponse = await wi.get();
        const diff: number = calcTimeDiff(
            [parseInt(mergedAnswers.start.slice(0, 2), 10), parseInt(mergedAnswers.start.slice(2, 4), 10)],
            [parseInt(mergedAnswers.end.slice(0, 2), 10), parseInt(mergedAnswers.end.slice(2, 4), 10)]
        );

        const ops: JsonPatch[] = [];
        const remaining: number = details.fields[Constants.ADO.FIELDS.REMAINING];
        if (typeof remaining === 'number' && !Number.isNaN(remaining)) {
            ops.push({
                op: 'replace',
                path: `/fields/${Constants.ADO.FIELDS.REMAINING}`,
                value: Math.max(0, fixedFloat(remaining - diff))
            });
        }

        await wi.update([
            ...ops,
            {
                op: 'replace',
                path: `/fields/${Constants.ADO.FIELDS.COMPLETED}`,
                value: fixedFloat((details.fields[Constants.ADO.FIELDS.COMPLETED] || 0) + diff)
            }
        ]);
    } catch (err) {
        throw new Error(err);
    }
}

init();
