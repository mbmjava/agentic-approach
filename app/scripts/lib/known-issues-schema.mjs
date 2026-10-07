const SUMMARY_COLUMNS = ['ID', 'Title', 'Status', 'Severity', 'Owner', 'Target'];
const DETAIL_FIELDS = ['Status', 'Severity', 'Owner', 'Opened', 'Target', 'Impact', 'Where', 'Trigger', 'Next'];
const SEVERITIES = new Set(['low', 'medium', 'high']);

function getSection(md, title) {
  const headings = [...md.matchAll(/^##\s+(.+?)\s*$/gm)];
  const index = headings.findIndex((match) => match[1] === title);
  if (index < 0) return null;
  const start = headings[index].index + headings[index][0].length;
  const end = headings[index + 1]?.index ?? md.length;
  return md.slice(start, end);
}

function cells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function readFields(body, id, file, errors) {
  const fields = {};
  for (const name of DETAIL_FIELDS) {
    const pattern = new RegExp(`\\*\\*${name}:\\*\\*\\s*([^·\\r\\n]+)`, 'g');
    const values = [...body.matchAll(pattern)].map((match) => match[1].trim());
    if (values.length !== 1 || !values[0]) {
      errors.push(`${file}: ${id} must have exactly one non-empty '${name}' field`);
    } else {
      fields[name] = values[0];
    }
  }
  if (fields.Severity && !SEVERITIES.has(fields.Severity)) {
    errors.push(`${file}: ${id} has invalid Severity '${fields.Severity}' (expected low, medium, or high)`);
  }
  if (fields.Opened && !/^\d{4}-\d{2}-\d{2}$/.test(fields.Opened)) {
    errors.push(`${file}: ${id} Opened must use YYYY-MM-DD`);
  }
  return fields;
}

/** Validate the known-issues summary/detail schema; ID gaps are allowed after resolved entries are deleted. */
export function checkKnownIssues(md, file = 'docs/architecture/known-issues.md') {
  const errors = [];
  const summarySection = getSection(md, 'Summary');
  const detailsSection = getSection(md, 'Details');
  if (summarySection === null) errors.push(`${file}: missing '## Summary' section`);
  if (detailsSection === null) errors.push(`${file}: missing '## Details' section`);
  if (summarySection === null || detailsSection === null) return errors;

  const summaryLines = summarySection.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
  const header = summaryLines.length ? cells(summaryLines[0]) : [];
  if (header.join('|') !== SUMMARY_COLUMNS.join('|')) {
    errors.push(`${file}: summary table columns must be ${SUMMARY_COLUMNS.join(' | ')}`);
  }
  if (summaryLines.length < 2 || !cells(summaryLines[1]).every((cell) => /^:?-{3,}:?$/.test(cell))) {
    errors.push(`${file}: summary table must include a Markdown separator row`);
  }

  const summary = new Map();
  for (const line of summaryLines.slice(2)) {
    const row = cells(line);
    if (!/^K\d+$/.test(row[0] ?? '')) {
      errors.push(`${file}: summary row has invalid ID '${row[0] ?? ''}'`);
      continue;
    }
    const id = row[0];
    if (summary.has(id)) errors.push(`${file}: duplicate summary id ${id}`);
    if (row.length !== SUMMARY_COLUMNS.length || row.slice(1).some((value) => !value)) {
      errors.push(`${file}: summary row ${id} must fill Title, Status, Severity, Owner, and Target`);
    }
    summary.set(id, row);
  }

  const headings = [...detailsSection.matchAll(/^###\s+(K\d+)\s+[—–-]\s+(.+?)\s*$/gm)];
  const details = new Map();
  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index];
    const id = heading[1];
    if (details.has(id)) errors.push(`${file}: duplicate detail id ${id}`);
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? detailsSection.length;
    details.set(id, {
      title: heading[2].trim(),
      fields: readFields(detailsSection.slice(start, end), id, file, errors),
    });
  }

  for (const [id, row] of summary) {
    const detail = details.get(id);
    if (!detail) {
      errors.push(`${file}: summary row ${id} has no detail block`);
      continue;
    }
    const values = {
      Title: detail.title,
      Status: detail.fields.Status,
      Severity: detail.fields.Severity,
      Owner: detail.fields.Owner,
      Target: detail.fields.Target,
    };
    for (let index = 1; index < SUMMARY_COLUMNS.length; index++) {
      const column = SUMMARY_COLUMNS[index];
      if (row[index] !== values[column]) {
        errors.push(`${file}: summary row ${id} ${column} does not match its detail block`);
      }
    }
  }
  for (const id of details.keys()) {
    if (!summary.has(id)) errors.push(`${file}: detail block ${id} has no summary row`);
  }
  return errors;
}
