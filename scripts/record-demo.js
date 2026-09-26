import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function recordDemo() {
  console.log('🎥 Starting browser recording for demo GIF...');

  const videoDir = path.resolve('recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  console.log('🌐 Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000');

  // Wait for list items to load from database
  await page.waitForSelector('.item-card');
  await page.waitForTimeout(1500);

  // Scroll down to showcase full list
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollBy({ top: -400, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Test Search Stretch Feature: Type "quantum"
  console.log('🔍 Demonstrating Search Stretch Feature...');
  const searchInput = page.locator('#search-input');
  await searchInput.click();
  await searchInput.type('quantum', { delay: 150 });
  await page.waitForTimeout(1500);

  // Open modal details view
  console.log('🔍 Opening detail modal...');
  const exploreBtn = page.locator('.view-btn').first();
  await exploreBtn.click();
  await page.waitForTimeout(1800);

  // Close modal
  const closeModalBtn = page.locator('#close-modal-btn');
  await closeModalBtn.click();
  await page.waitForTimeout(1000);

  // Clear search input
  console.log('🧹 Clearing search input...');
  const clearBtn = page.locator('#clear-search-btn');
  await clearBtn.click();
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();

  // Find recorded video file
  const videoFiles = fs.readdirSync(videoDir).filter((file) => file.endsWith('.webm'));
  if (videoFiles.length === 0) {
    throw new Error('No recorded video file found!');
  }

  const webmPath = path.join(videoDir, videoFiles[0]);
  const gifPath = path.resolve('demo.gif');

  console.log(`🎬 Converting ${webmPath} to ${gifPath} via ffmpeg...`);
  execSync(
    `ffmpeg -y -i "${webmPath}" -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`
  );

  console.log('✅ demo.gif created successfully!');
}

recordDemo().catch((err) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
