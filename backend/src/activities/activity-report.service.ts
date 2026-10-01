import { Injectable } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import PDFDocument from 'pdfkit';
import type { Activity } from '../entities/index.js';
import { UPLOAD_DIR } from './upload.config.js';

const INK = '#090015';
const INK_MUTED = '#3d3650';
const INK_SUBTLE = '#6b6478';
const LINE = '#e1dbd8';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Renders a completed activity as a printable PDF report. */
@Injectable()
export class ActivityReportService {
  generate(activity: Activity): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 56, bufferPages: true });

    doc
      .fillColor(INK_SUBTLE)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(
        `LOGGED BY ${activity.author.name.toUpperCase()}${
          activity.author.jobTitle ? ' · ' + activity.author.jobTitle.toUpperCase() : ''
        }`,
      );
    doc.moveDown(0.4);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(22).text(activity.title);
    doc.moveDown(0.15);
    doc.fillColor(INK_MUTED).font('Helvetica').fontSize(11).text(`${activity.project.code} · ${activity.project.name}`);
    doc.moveDown(0.8);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor(LINE)
      .stroke();
    doc.moveDown(0.8);

    const field = (label: string, value: string) => {
      doc.fillColor(INK_SUBTLE).font('Helvetica-Bold').fontSize(8.5).text(label.toUpperCase());
      doc.fillColor(INK).font('Helvetica').fontSize(11).text(value);
      doc.moveDown(0.7);
    };

    field('Status', 'Completed');

    let dateLine = formatDate(activity.date);
    if (activity.startTime) {
      dateLine += ` · ${activity.startTime}`;
      if (activity.endTime) dateLine += ` – ${activity.endTime}`;
    }
    field('Date', dateLine);
    field('Location', activity.location);

    const staff = [activity.author, ...activity.collaborators.getItems()]
      .map((person) => person.name + (person.jobTitle ? ` (${person.jobTitle})` : ''))
      .join(', ');
    field('Staff involved', staff);

    if (activity.description) field('Details', activity.description);
    if (activity.outcome) field('Outcome', activity.outcome);

    const photos = activity.photos.getItems();
    if (photos.length > 0) {
      doc.moveDown(0.3);
      doc.fillColor(INK_SUBTLE).font('Helvetica-Bold').fontSize(8.5).text(`PHOTOS (${photos.length})`);
      doc.moveDown(0.5);

      for (const photo of photos) {
        const filePath = join(UPLOAD_DIR, photo.filename);
        if (doc.y > doc.page.height - doc.page.margins.bottom - 200) doc.addPage();
        if (existsSync(filePath)) {
          try {
            doc.image(filePath, { fit: [240, 180] });
          } catch {
            // Skip a file that can't be decoded as an image.
          }
        }
        if (photo.caption) {
          doc.moveDown(0.2);
          doc.fillColor(INK_MUTED).font('Helvetica-Oblique').fontSize(9.5).text(photo.caption);
        }
        doc.moveDown(0.8);
      }
    }

    doc.moveDown(1);
    doc
      .fillColor(INK_SUBTLE)
      .font('Helvetica')
      .fontSize(8)
      .text(`Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · CARE Rwanda Activity Board`);

    doc.end();
    return doc;
  }
}
