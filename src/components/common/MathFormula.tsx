import React, { useMemo } from 'react';
import katex from 'katex';

export const UET_KATEX_MACROS: Record<string, string> = {
  '\\lojoin': '\\mathbin{\\vcenter{\\hbox{\\rule{0.35em}{0.055em}\\llap{\\raisebox{0.44em}{\\rule{0.35em}{0.055em}}}}\\mkern-1mu}\\bowtie}',
  '\\rojoin': '\\mathbin{\\bowtie\\mkern-1mu\\vcenter{\\hbox{\\rule{0.35em}{0.055em}\\llap{\\raisebox{0.44em}{\\rule{0.35em}{0.055em}}}}} }',
  '\\fojoin': '\\mathbin{\\vcenter{\\hbox{\\rule{0.35em}{0.055em}\\llap{\\raisebox{0.44em}{\\rule{0.35em}{0.055em}}}}\\mkern-1mu}\\bowtie\\mkern-1mu\\vcenter{\\hbox{\\rule{0.35em}{0.055em}\\llap{\\raisebox{0.44em}{\\rule{0.35em}{0.055em}}}}} }',
  '\\GF': '{}_{#1}\\mathcal{F}_{#2}',
  '\\Dom': '\\operatorname{Dom}',
  '\\pk': '\\underline{\\text{#1}}',
};

export interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      macros: UET_KATEX_MACROS,
      output: 'htmlAndMathml',
    });
  }, [tex, displayMode]);

  if (displayMode) {
    return (
      <div
        className={`uet-math-block overflow-x-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`uet-math-inline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
