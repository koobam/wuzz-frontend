
export const languages = [{
    label: 'English',
    description: 'Use English',
    value: 'en',
    flag: 'us',
    }, {
    label: 'Bahasa Indonesia',
    description: 'Gunakan Bahasa Indonesia',
    value: 'id',
    flag: 'id',
    },
];

export type LanguageType = {
    label: string;
    /** One line under the name, in the language itself. */
    description: string;
    value: string;
    flag: string;
};
