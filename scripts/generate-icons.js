/* eslint-env node */
/**
 * Icon Generator Script
 * Generates PNG icons for the AniTick Chrome Extension
 *
 * Run: npm install canvas && node scripts/generate-icons.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const outputDir = path.join(__dirname, '..', 'assets', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate icon at specified size
 * Design: Amber gradient with "A" letter (for AniTick)
 */
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - rounded square with amber gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#f59e0b'); // Amber 500
  gradient.addColorStop(1, '#d97706'); // Amber 600

  const radius = size * 0.2;

  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw "tick" icon (checkmark inside a clock-like circle) - simplified as a play/tick symbol
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw a stylized "A" with a tick
  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.5;

  // Draw tick/checkmark
  ctx.beginPath();
  ctx.moveTo(centerX - iconSize * 0.35, centerY);
  ctx.lineTo(centerX - iconSize * 0.05, centerY + iconSize * 0.3);
  ctx.lineTo(centerX + iconSize * 0.4, centerY - iconSize * 0.3);
  ctx.stroke();

  return canvas;
}

// Generate all sizes
for (const size of sizes) {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}.png`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filename}`);
}

console.log('\nAll icons generated successfully!');
