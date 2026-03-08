// Run with: node scripts/gen-placeholders.js
// Creates minimal 1x1 PNG placeholders for PWA icons
import { writeFileSync, mkdirSync } from 'fs';

// Minimal valid PNG (1x1 pixel, dark blue)
const png = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e00000000c4944415478016360a0400000006000148e2a5640000000049454e44ae426082',
  'hex'
);

const dir = 'public/icons';
mkdirSync(dir, { recursive: true });
[44, 50, 150, 192, 512].forEach(s => {
  writeFileSync(`${dir}/icon-${s}.png`, png);
  console.log(`Created icon-${s}.png (placeholder)`);
});

mkdirSync('public/screenshots', { recursive: true });
writeFileSync('public/screenshots/gameplay-wide.png', png);
writeFileSync('public/screenshots/gameplay-narrow.png', png);
console.log('Created screenshot placeholders');
