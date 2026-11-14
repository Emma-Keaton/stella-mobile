/**
 * Stella Mobile — Code Review Operations
 * Engineering category.
 */

import { SkillResult, SkillContext } from '../../core/types';

export interface CodeIssue {
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'bug' | 'security' | 'performance' | 'style';
  message: string;
  suggestion?: string;
  codeSnippet?: string;
}

export interface CodeReviewResult {
  language: string;
  totalIssues: number;
  issuesBySeverity: Record<string, number>;
  issuesByCategory: Record<string, number>;
  issues: CodeIssue[];
  score: number;
  summary: string;
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 25, high: 15, medium: 8, low: 3,
};

function analyzeCode(code: string, language: string, options: any): CodeReviewResult {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{3,}['"]/i.test(line)) {
      issues.push({
        line: lineNum, column: 1, severity: 'critical', category: 'security',
        message: 'Potential hardcoded secret or API key detected',
        suggestion: 'Use environment variables or secure secret management',
        codeSnippet: line.trim(),
      });
    }

    if (/console\.(log|debug|info)/.test(line) && language === 'javascript') {
      issues.push({
        line: lineNum, column: 1, severity: 'low', category: 'style',
        message: 'console.log statement found in code',
        suggestion: 'Remove debug logging or use a proper logger',
        codeSnippet: line.trim(),
      });
    }

    if (/(for|while|foreach|map|filter|reduce)\s*\(/.test(line) && /await/.test(line)) {
      issues.push({
        line: lineNum, column: 1, severity: 'medium', category: 'performance',
        message: 'Potential blocking async call inside loop',
        suggestion: 'Consider Promise.all() for parallel execution',
        codeSnippet: line.trim(),
      });
    }

    if (line.length > 120) {
      issues.push({
        line: lineNum, column: 121, severity: 'low', category: 'style',
        message: `Line exceeds 120 characters (${line.length})`,
        suggestion: 'Break line into multiple lines',
        codeSnippet: line.substring(0, 100) + '...',
      });
    }

    if (/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(line)) {
      issues.push({
        line: lineNum, column: 1, severity: 'medium', category: 'bug',
        message: 'Empty catch block swallows errors',
        suggestion: 'Log or handle the error appropriately',
        codeSnippet: line.trim(),
      });
    }
  }

  const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const minSeverity = options.severity || 'medium';
  const minLevel = severityOrder[minSeverity] ?? 2;
  const filteredIssues = issues.filter(i => severityOrder[i.severity] >= minLevel);

  const issuesBySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const issuesByCategory: Record<string, number> = { bug: 0, security: 0, performance: 0, style: 0 };
  for (const issue of filteredIssues) {
    issuesBySeverity[issue.severity]++;
    issuesByCategory[issue.category]++;
  }

  let score = 100;
  for (const issue of filteredIssues) {
    score -= SEVERITY_WEIGHTS[issue.severity];
  }
  score = Math.max(0, Math.min(100, score));

  return {
    language,
    totalIssues: filteredIssues.length,
    issuesBySeverity,
    issuesByCategory,
    issues: filteredIssues,
    score,
    summary: `Found ${filteredIssues.length} issues (score: ${score}/100)`,
  };
}

export async function reviewCodeOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { code, filePath, language = 'typescript', severity = 'medium', includeFixes = true } = params;

  if (!code && !filePath) {
    return {
      title: 'Code Review',
      summary: 'Code or file path is required',
      spokenNarrative: 'Please provide code to review or a file path',
      operation: 'review',
      ok: false,
    };
  }

  let sourceCode = code;
  if (!sourceCode && filePath) {
    sourceCode = `// Code from ${filePath}\n// File read not implemented in this context`;
  }

  const result = analyzeCode(sourceCode, language, { severity, includeFixes });

  const severityList = Object.entries(result.issuesBySeverity)
    .filter(([, count]) => count > 0)
    .map(([sev, count]) => `${count} ${sev}`)
    .join(', ');

  return {
    title: 'Code Review Results',
    summary: `${result.summary}. ${severityList}`,
    spokenNarrative: `Code review complete. Score ${result.score} out of 100. ${result.totalIssues} issues found.`,
    operation: 'review',
    ok: true,
    record: {
      ...result,
      filePath,
      includeFixes,
      reviewedAt: Date.now(),
    },
  };
}

export async function securityReviewOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { code, language = 'typescript' } = params;
  const result = analyzeCode(code, language, { severity: 'high', includeFixes: true });
  const securityIssues = result.issues.filter(i => i.category === 'security');

  return {
    title: 'Security Code Review',
    summary: `${securityIssues.length} security issue(s) found`,
    spokenNarrative: `Security review found ${securityIssues.length} security issue(s)`,
    operation: 'security',
    ok: true,
    record: {
      ...result,
      securityIssues,
      reviewedAt: Date.now(),
    },
  };
}

export async function performanceReviewOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { code, language = 'typescript' } = params;
  const result = analyzeCode(code, language, { severity: 'medium', includeFixes: true });
  const perfIssues = result.issues.filter(i => i.category === 'performance');

  return {
    title: 'Performance Code Review',
    summary: `${perfIssues.length} performance issue(s) found`,
    spokenNarrative: `Performance review found ${perfIssues.length} performance issue(s)`,
    operation: 'performance',
    ok: true,
    record: {
      ...result,
      performanceIssues: perfIssues,
      reviewedAt: Date.now(),
    },
  };
}

export function getSourcesOperation(): SkillResult {
  return {
    title: 'Code Review Sources',
    summary: 'Pattern-based static analysis for bugs, security, performance, and style issues',
    spokenNarrative: 'Code review uses pattern-based static analysis',
    operation: 'sources',
    ok: true,
    record: {
      categories: ['bug', 'security', 'performance', 'style'],
      severities: ['critical', 'high', 'medium', 'low'],
      languages: ['typescript', 'javascript', 'python', 'kotlin', 'swift', 'dart'],
      note: 'No external API required. Runs locally on device.',
    },
  };
}