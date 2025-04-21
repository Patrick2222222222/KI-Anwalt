// pages/api/admin/export-report.js
import authMiddleware from '../../../middleware/auth';
import { createObjectCsvStringifier } from 'csv-writer';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

async function handler(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Zugriff verweigert' });
  }
  
  const { format = 'csv', timeRange = 'month' } = req.query;
  
  try {
    // In a real implementation, this data would be fetched from the database
    // For now, we'll use mock data similar to the statistics endpoint
    
    // Generate mock data for the report
    const reportData = generateReportData(timeRange);
    
    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCsvReport(reportData, timeRange);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="lawmaster24_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.status(200).send(csvContent);
    } else if (format === 'pdf') {
      // Generate PDF
      const pdfBuffer = await generatePdfReport(reportData, timeRange);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="lawmaster24_report_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } else {
      return res.status(400).json({ message: 'Ungültiges Format. Unterstützte Formate: csv, pdf' });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ message: 'Serverfehler beim Generieren des Berichts' });
  }
}

function generateReportData(timeRange) {
  // Generate dates based on time range
  let dates = [];
  let dataPoints = 0;
  
  const today = new Date();
  
  switch(timeRange) {
    case 'week':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      dataPoints = 7;
      break;
    case 'month':
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      dataPoints = 30;
      break;
    case 'year':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        dates.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
      }
      dataPoints = 12;
      break;
    default:
      // Default to month
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      dataPoints = 30;
  }
  
  // Generate random data for the report
  const reportRows = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const newUsers = Math.floor(Math.random() * 20) + 1;
    const activeUsers = Math.floor(Math.random() * 100) + 50;
    const newCases = Math.floor(Math.random() * 30) + 5;
    const revenue = Math.floor(Math.random() * 500) + 100;
    const completedCases = Math.floor(Math.random() * 25) + 3;
    
    reportRows.push({
      date: dates[i],
      newUsers,
      activeUsers,
      newCases,
      revenue,
      completedCases
    });
  }
  
  return reportRows;
}

function generateCsvReport(reportData, timeRange) {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'date', title: 'Datum' },
      { id: 'newUsers', title: 'Neue Benutzer' },
      { id: 'activeUsers', title: 'Aktive Benutzer' },
      { id: 'newCases', title: 'Neue Fälle' },
      { id: 'revenue', title: 'Umsatz (€)' },
      { id: 'completedCases', title: 'Abgeschlossene Fälle' }
    ]
  });
  
  const header = csvStringifier.getHeaderString();
  const records = csvStringifier.stringifyRecords(reportData);
  
  // Add report title and metadata
  const title = `lawmaster24.com Bericht - ${getTimeRangeLabel(timeRange)}\n`;
  const generatedDate = `Generiert am: ${new Date().toLocaleString('de-DE')}\n\n`;
  
  return title + generatedDate + header + records;
}

async function generatePdfReport(reportData, timeRange) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('lawmaster24.com Bericht', 14, 22);
  
  // Add subtitle with time range
  doc.setFontSize(14);
  doc.text(`Zeitraum: ${getTimeRangeLabel(timeRange)}`, 14, 32);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, 14, 40);
  
  // Prepare data for the table
  const tableColumn = ['Datum', 'Neue Benutzer', 'Aktive Benutzer', 'Neue Fälle', 'Umsatz (€)', 'Abgeschlossene Fälle'];
  const tableRows = reportData.map(item => [
    item.date,
    item.newUsers,
    item.activeUsers,
    item.newCases,
    item.revenue.toFixed(2),
    item.completedCases
  ]);
  
  // Add the table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [58, 134, 255]
    }
  });
  
  // Calculate summary statistics
  const totalNewUsers = reportData.reduce((sum, row) => sum + row.newUsers, 0);
  const totalNewCases = reportData.reduce((sum, row) => sum + row.newCases, 0);
  const totalRevenue = reportData.reduce((sum, row) => sum + row.revenue, 0);
  const totalCompletedCases = reportData.reduce((sum, row) => sum + row.completedCases, 0);
  
  // Add summary section
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Zusammenfassung', 14, finalY);
  
  doc.setFontSize(10);
  doc.text(`Gesamtzahl neuer Benutzer: ${totalNewUsers}`, 14, finalY + 10);
  doc.text(`Gesamtzahl neuer Fälle: ${totalNewCases}`, 14, finalY + 18);
  doc.text(`Gesamtumsatz: ${totalRevenue.toFixed(2)} €`, 14, finalY + 26);
  doc.text(`Gesamtzahl abgeschlossener Fälle: ${totalCompletedCases}`, 14, finalY + 34);
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Seite ${i} von ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.text('lawmaster24.com', 14, doc.internal.pageSize.height - 10);
  }
  
  // Return the PDF as a buffer
  return Buffer.from(doc.output('arraybuffer'));
}

function getTimeRangeLabel(timeRange) {
  switch(timeRange) {
    case 'week':
      return 'Letzte Woche';
    case 'month':
      return 'Letzter Monat';
    case 'year':
      return 'Letztes Jahr';
    default:
      return 'Letzter Monat';
  }
}

export default authMiddleware(handler);
