const { PDFDocument, degrees} = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function addImageWatermarkToPDF(inputPath, imagePath, outputPath) {
    try {
        const pdfBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

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
                opacity: 0.12, // Set the opacity of the watermark (optional)
            });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, modifiedPdfBytes);
        console.log(`Image watermark added to ${inputPath}.`);

    } catch (error) {
        console.log(`Error adding image watermark to ${inputPath}:`, error);
    }
}

async function addWatermarkToFolder(inputFolderPath, watermarkImagePath, outputFolderPath) {
    try {

        const files = await fs.readdir(inputFolderPath);

        await fs.mkdir(outputFolderPath, { recursive: true });

        for (const file of files) {
            const inputFilePath = path.join(inputFolderPath, file);
            const outputFilePath = path.join(outputFolderPath, file);
            await addImageWatermarkToPDF(inputFilePath, watermarkImagePath, outputFilePath);
        }
        console.log('Watermark applied to all files in the folder.');

    } catch (error) {
        console.log('Error applying watermark to folder:', error);
    }
}

const inputFolderPath = './Sample'; //Enter the folder path here by downloading the folder from paperman 
const watermarkImagePath = './cepstrum.png';
const outputFolderPath = `${inputFolderPath}New`;

addWatermarkToFolder(inputFolderPath, watermarkImagePath, outputFolderPath);
