const fs = require('fs');
const path = require('path');

// Carregue o JSON do arquivo
const json = require('../test-results.json');

// Função para mapear status para emoji/resultado
function statusToMd(status) {
  if (status === 'passed') return '🟢';
  if (status === 'failed' || status === 'timedOut') return '🔴';
  if (status === 'skipped') return '🟡';
  return '🔵';
}

// Extrai a data de execução do campo stats.startTime
function formatDate(iso) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

const dataExecucao = formatDate(json.stats?.startTime);

// Monta o markdown inicial
let md = `---\nsidebar_position: 7\n---\n\n# **Relatório de Testes Automatizados**\n\n**Data de execução:** ${dataExecucao}\n\n---\n`;

// Percorre todos os arquivos de teste (suites)
json.suites.forEach(suite => {
  suite.specs.forEach(spec => {
    // Nome do cenário: pode ser o título do spec ou do arquivo
    const cenarioNome = spec.title || suite.title;
    md += `\n## Cenário: ${cenarioNome}\n\n`;
    md += '| Projeto | Status |\n';
    md += '|---------|--------|\n';

    // Para cada execução do teste (por projeto/navegador)
    spec.tests.forEach(test => {
      // O nome do projeto está em projectName
      const project = test.projectName || test.projectId || '-';
      // O status pode ser 'passed', 'failed', 'timedOut', etc.
      // Se houver múltiplos results (retries), pega o último
      const lastResult = test.results && test.results.length > 0 ? test.results[test.results.length - 1] : {};
      const status = lastResult.status || test.status;
      md += `| ${project} | ${statusToMd(status)} |\n`;
    });

    md += '\n---\n';
  });
});

md += '\n> Relatório gerado automaticamente a partir dos resultados do JSON de testes.\n';

// Salva o arquivo
const outputPath = path.resolve('../docs');
console.log('Arquivo test-report.md gerado em:', outputPath);
fs.writeFileSync('./docs/tutorial-basics/test-report.md', md);
console.log('Arquivo test-report.md gerado!');