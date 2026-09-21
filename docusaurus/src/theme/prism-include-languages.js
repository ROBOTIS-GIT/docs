import includePrismLanguages from '@theme-original/prism-include-languages';

const bashOptionPattern =
  /(^|\s)-{1,2}(?:\w+:[+-]?)?[\w-]+(?:\.[\w-]+)*(?=[=\s]|$)/;

export default function includePrismLanguagesWithHyphenatedOptions(PrismObject) {
  includePrismLanguages(PrismObject);

  if (PrismObject.languages.bash) {
    PrismObject.languages['bash-cli-options'] = PrismObject.languages.extend(
      'bash',
      {
        parameter: {
          pattern: bashOptionPattern,
          alias: 'variable',
          lookbehind: true,
        },
      },
    );
  }
}
