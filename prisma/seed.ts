import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Row = {
  code: string;
  title: string;
  type: string;
  CREDIT: string;
  section: string;
  instructor: string;
  max_capacity: string;
  timetable_data: string;
  timetable: string;
};

// CSV 안에 쉼표가 들어간 과목명도 안전하게 처리하는 간단한 CSV 파서입니다.
// 예: "Science, Technology and Economy" 같은 값이 있어도 컬럼이 밀리지 않습니다.
function parseCsv(text: string): Row[] {
  const lines: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) lines.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) lines.push(row);
  }

  const headers = lines[0].map((header) => header.trim().replace(/^\uFEFF/, ''));

  return lines.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = (values[index] ?? '').trim();
    });
    return obj as Row;
  });
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function main() {
  // seed.ts와 courses_seed_no_korea_title_with_credit.csv를 둘 다 prisma/ 폴더 안에 넣는 기준입니다.
  const csvPath = path.join(__dirname, 'courses_seed_no_korea_title_with_credit.csv');
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csvText);

  // 재실행해도 같은 데이터가 쌓이지 않게 자식 테이블부터 비웁니다.
  await prisma.enrollment.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();

  for (const row of rows) {
    const course = await prisma.course.upsert({
      where: { code: row.code },
      update: {
        title: row.title,
        type: row.type,
        credit: toNumber(row.CREDIT, 3),
      },
      create: {
        code: row.code,
        title: row.title,
        type: row.type,
        credit: toNumber(row.CREDIT, 3),
      },
    });

    const section = await prisma.section.create({
      data: {
        sectionNo: row.section,
        instructor: row.instructor || 'TBA',
        maxCapacity: toNumber(row.max_capacity, 0),
        currentSeats: 0,
        timetableText: row.timetable || null,
        courseId: course.id,
      },
    });

    const slotCodes = row.timetable_data
      .split('|')
      .map((slot) => slot.trim())
      .filter(Boolean);

    if (slotCodes.length > 0) {
      await prisma.timeSlot.createMany({
        data: slotCodes.map((slotCode) => ({
          slotCode,
          sectionId: section.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  console.log(`Seeded ${rows.length} sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
