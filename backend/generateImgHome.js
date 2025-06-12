const fs = require("fs");
const path = require("path");

const rootFolder = path.join(__dirname, "../public/assets/SDM");
const allowedFolders = ["Dokter", "Perawat", "Bidan", "Dokter Gigi"];
const output = {};

fs.readdirSync(rootFolder).forEach(folder => {
  if (!allowedFolders.includes(folder)) return;

  const folderPath = path.join(rootFolder, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    const images = fs.readdirSync(folderPath)
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .map(file => ({
        fileName: path.parse(file).name,
        src: `/assets/SDM/${folder}/${file}`
      }));

    output[folder] = images;
  }
});

fs.writeFileSync(
  path.join(__dirname, "../public/assets/sdm-home.json"),
  JSON.stringify(output, null, 2),
  "utf-8"
);

console.log("✅ Berhasil generate sdm-home.json (khusus Dokter, Perawat, Bidan, Dokter Gigi)");
