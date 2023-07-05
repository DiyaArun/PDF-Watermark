const { PDFDocument, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function addImageWatermarkToPDF(inputPath, imagePath, outputPath) {
  try {
    const pdfBytes = await fs.readFile(inputPath);
    //console.log(pdfBytes);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    //console.log(pdfDoc);

    const watermarkImageBytes = await fs.readFile(imagePath);
    const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);

    const pageCount = pdfDoc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);

      const { width, height } = page.getSize();
      const imageWidth = watermarkImage.width;
      const imageHeight = watermarkImage.height;
      const xPos = 200;
      const yPos = 200;

      page.drawImage(watermarkImage, {
        x: xPos,
        y: yPos,
        width: imageWidth,
        height: imageHeight,
        rotate: degrees(52.3057595333),
        opacity: 0.2, 
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, modifiedPdfBytes);
    console.log(`Image watermark added to ${inputPath}.`);
  } catch (error) {
    console.log(`Error adding image watermark to ${inputPath}:`, error);
  }
}

async function processFilesRecursively(folderPath, watermarkImagePath, outputFolderPath) {
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const outputFilePath = path.join(outputFolderPath, file);

      const stats = await fs.stat(filePath);
      //console.log(stats);
      if(!filePath.includes('Books')){
        if (stats.isDirectory()) {

            const subfolderOutputPath = path.join(outputFolderPath, file);
            await fs.mkdir(subfolderOutputPath, { recursive: true });
            await processFilesRecursively(filePath, watermarkImagePath, subfolderOutputPath);
          } else {
            await addImageWatermarkToPDF(filePath, watermarkImagePath, outputFilePath);
          }
      }
    }
  } catch (error) {
    console.log(`Error processing files in ${folderPath}:`, error);
  }
}

async function addWatermarkToFolder(inputFolderPath, watermarkImagePath, outputFolderPath) {
  try {
    await fs.mkdir(outputFolderPath, { recursive: true });
    await processFilesRecursively(inputFolderPath, watermarkImagePath, outputFolderPath);
    console.log('Watermark applied to all files in the folder.');
  } catch (error) {
    console.log('Error applying watermark to folder:', error);
  }
}

const inputFolderPath = './Sample'; // Enter the folder path here by downloading the folder from paperman
const watermarkImagePath = './cepstrum.png';
const outputFolderPath = `${inputFolderPath}`;

addWatermarkToFolder(inputFolderPath, watermarkImagePath, outputFolderPath);
