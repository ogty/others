type Prop = {
  name: string;
  initialValue: any;
};

class GenerateHeader {
  propDefinitionTemplate = "\t${name}: ${type};";
  variableTemplate = "\t${name} = ${value}";

  common(templateParts: TemplateStringsArray, data: string[]): string {
    const result: string[] = [];
    const maxLength = Math.max(templateParts.length, data.length);
    for (let i = 0; i < maxLength; i += 1) {
      if (i < templateParts.length) {
        result.push(templateParts[i]);
      }
      if (i < data.length) {
        result.push(data[i]);
      }
    }
    return result.join("\n");
  }

  processor(props: Prop[]): string[][] {
    const formatter = (value: any): string => {
      return typeof value === "string" ? `'${value}'` : value;
    };
    const propDefinitions: string[] = [];
    const variableProps: string[] = [];
    props.forEach((prop: Prop) => {
      const { name, initialValue } = prop;
      const setValue = (template: string) => {
        return template
          .replace("${name}", name)
          .replace("${type}", typeof initialValue)
          .replace("${value}", formatter(initialValue));
      };
      propDefinitions.push(setValue(this.propDefinitionTemplate));
      variableProps.push(setValue(this.variableTemplate));
    });
    return [propDefinitions, variableProps];
  }

  astro(strings: TemplateStringsArray, ...values: (Prop[] | string)[]): string {
    const [props, _, code = ""] = values;
    const [interfaceProps, variableProps] = this.processor(props as Prop[]);
    const data = [
      interfaceProps.join("\n"),
      variableProps.join(",\n"),
      code,
    ] as string[];
    return this.common(strings, data);
  }

  svelte(strings: TemplateStringsArray, ...values: (Prop[] | string)[]) {
    const [props, code = ""] = values;
    const [declarations] = this.processor(props as Prop[]);
    const data = [declarations.join("\n"), code] as string[];
    return this.common(strings, data);
  }

  tsx(strings: TemplateStringsArray, ...values: (Prop[] | string)[]): string {
    const [props, componentName, _, code] = values;
    const [interfaceProps, variableProps] = this.processor(props as Prop[]);
    const data = [
      interfaceProps.join("\n"),
      `$${componentName}$`,
      variableProps.join(",\n"),
      code,
    ] as string[];
    return this.common(strings, data).replace(/\$([^\$]+)\$/g, "$1");
  }
}

const props: Prop[] = [
  {
    name: "color",
    initialValue: "currentColor",
  },
  {
    name: "size",
    initialValue: 16,
  },
];

const generateHeader = new GenerateHeader();

// --- Astro ---
generateHeader.variableTemplate = "\t${name}";
const astroHeader = generateHeader.astro`---
export interface Props {${props}}

const {${""}} = Astro.props;
---`;
console.log(astroHeader);
/*
╭─ astro ──────────────────────────────────────────────────────────────────────────────────────────╮
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ---                                                                                              │
│ export interface Props {                                                                         │
│     color: string;                                                                               │
│     size: number;                                                                                │
│ }                                                                                                │
│                                                                                                  │
│ const {                                                                                          │
│     color,                                                                                       │
│     size                                                                                         │
│ } = Astro.props;                                                                                 │
│ ---                                                                                              │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
*/

// --- Svelte ---
generateHeader.propDefinitionTemplate = "\texport let ${name} = ${value};";
const svelteHeader = generateHeader.svelte`<script lang="ts">${props}</script>`;
console.log(svelteHeader);
/*
╭─ svelte ─────────────────────────────────────────────────────────────────────────────────────────╮
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ <script lang="ts">                                                                               │
│     export let color = 'currentColor';                                                           │
│     export let size = 16;                                                                        │
│ </script>                                                                                        │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
*/

// --- React ---
const patternOneComponentName = "ComponentName";

// The first way to write React components
generateHeader.variableTemplate = "\t\t${name}";
generateHeader.propDefinitionTemplate = "\t${name}: ${type};";
const tsxPatternOne = generateHeader.tsx`type Props {${props}}

export default function ${patternOneComponentName}(props: Props) {
\tconst {${""}\t} = props;

\treturn (<></>);
}
`;
console.log(tsxPatternOne);
/*
╭─ tsx ────────────────────────────────────────────────────────────────────────────────────────────╮
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ type Props {                                                                                     │
│     color: string;                                                                               │
│     size: number;                                                                                │
│ }                                                                                                │
│                                                                                                  │
│ export default function ComponentName(props: Props) {                                            │
│     const {                                                                                      │
│         color = 'currentColor',                                                                  │
│         size = 16                                                                                │
│     } = props;                                                                                   │
│                                                                                                  │
│     return (<></>);                                                                              │
│ }                                                                                                │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
*/

// The second way to write React components
const patternTwoComponentName = "GitHub";
const gitHub = `\t\t<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
\t\t\t<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
\t\t</svg>`;
const tsxPatternTwo = generateHeader.tsx`type Props {${props}}

export const ${patternTwoComponentName}: React.FC<Props> = (props) => {
\tconst {${""}\t} = props;

\treturn (${gitHub}\t);
}
`;
console.log(tsxPatternTwo);
/*
╭─ tsx ─ GitHub.tsx ───────────────────────────────────────────────────────────────────────────────╮
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ type Props {                                                                                     │
│     color: string;                                                                               │
│     size: number;                                                                                │
│ }                                                                                                │
│                                                                                                  │
│ export const GitHub: React.FC<Props> = (props) => {                                              │
│     const {                                                                                      │
│         color,                                                                                   │
│         size                                                                                     │
│     } = props;                                                                                   │
│                                                                                                  │
│     return (                                                                                     │
│         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class │
│ ="bi bi-github" viewBox="0 0 16 16">                                                             │
│             <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19- │
│ .01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-. │
│ 01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.8 │
│ 7.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09  │
│ 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3. │
│ 65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4 │
│ .42-3.58-8-8-8z"/>                                                                               │
│         </svg>                                                                                   │
│     );                                                                                           │
│ }                                                                                                │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
*/
