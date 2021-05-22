export type ConstantsStructure = {
    ADO: {
        VERSION: string,
        FIELDS: {
            REMAINING: string,
            COMPLETED: string,
        }
    }
}

const constants: ConstantsStructure = {
    ADO: {
        VERSION: '5.1',
        FIELDS: {
            REMAINING: 'Microsoft.VSTS.Scheduling.RemainingWork',
            COMPLETED: 'Microsoft.VSTS.Scheduling.CompletedWork'
        }
    }
}

export default constants;