import fs from 'fs';
import path from 'path';

const eurovisionCountries = [
  "AL", "AM", "AU", "AT", "AZ", "BE", "HR", "CY", "CZ", "DK", "EE", "FI",
  "FR", "GE", "DE", "GR", "IS", "IE", "IL", "IT", "LV", "LT", "LU", "MT",
  "ME", "NL", "NO", "PL", "PT", "SM", "RS", "SI", "ES", "SE", "CH", "UA", "GB"
];

const inputDir = path.resolve('./public/flags/1x1');
const outputDir = path.resolve('./src/components/Country');

(async () => {
  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`);
    return;
  }
  if (!fs.existsSync(outputDir)) {
    console.error(`Output directory does not exist: ${outputDir}`);
    return;
  }

  eurovisionCountries.forEach(code => {
    const filename = `${code.toLowerCase()}.svg`;
    const source = path.join(inputDir, filename);
    const target = path.join(outputDir, filename);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
      console.log(`✔ Copied ${filename}`);
    } else {
      console.warn(`✖ Missing: ${filename}`);
    }
  });
})();
