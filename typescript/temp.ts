function getData(data: any, path: string): any {
    for (const key of path.split('.')) {
        data = data[key]
    }
    return data;
}

const paths: string[] = [];
const generateBreadcrumbList = (data: any, parent: string) => {
    if (data instanceof Object) {
        for (const key in data) {
            const path = parent ? `${parent}.${key}` : key;
            generateBreadcrumbList(data[key], path);
        }
    } else {
        paths.push(parent);
    }
}

function segmente(data: any, languages: string[]): any {
    const result: any = {};
    const process = (data: any, language: string) => {
        const element: any = {};
        for (const key in data) {
            if (language in data[key]) {
                element[key] = data[key][language];
                continue;
            }
            element[key] = process(data[key], language);
        }
        result[language] = element;
        return element;
    }

    languages.map((language: string) => {
        result[language] = {};
        process(data, language)
    })
    return result;
}
