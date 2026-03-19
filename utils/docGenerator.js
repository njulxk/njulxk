const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

function generateSummaryDoc(summary, type, startDate, endDate) {
  const reportType = type === 'daily' ? '日报' : '周报';
  const title = `${startDate} AI投研研究个人${reportType}`;
  
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '姓名', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '内容', bold: true })] })],
          width: { size: 80, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];
  
  summary.forEach(item => {
    const content = item.content || '未提交';
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(item.name)],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(content)],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );
  });
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `生成时间: ${new Date().toLocaleString('zh-CN')}`,
            spacing: { after: 400 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });
  
  return doc;
}

async function saveSummaryDoc(summary, type, startDate, endDate) {
  const doc = generateSummaryDoc(summary, type, startDate, endDate);
  const buffer = await Packer.toBuffer(doc);
  
  const reportType = type === 'daily' ? '日报' : '周报';
  const fileName = `${startDate} AI投研研究个人${reportType}.docx`;
  const filePath = path.join(__dirname, '..', 'exports', fileName);
  
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  
  fs.writeFileSync(filePath, buffer);
  
  return { filePath, fileName };
}

module.exports = { generateSummaryDoc, saveSummaryDoc };