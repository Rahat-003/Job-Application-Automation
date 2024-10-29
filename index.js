const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { replaceTextInTex, deleteFileIfExists } = require("./modifyLatex");
const { generateEmail } = require("./modifyEmail");

const util = require("util");

const execPromise = util.promisify(exec);

const createPdfFromLatex = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error("LaTeX file not found.");
            return;
        }

        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath, ".tex");
        const outputPdfPath = path.join(
            __dirname,
            `./../Without pic/${fileName}.pdf`
        );

        // Run pdflatex command to compile LaTeX to PDF in the specified directory
        const { stdout, stderr } = await execPromise(
            `pdflatex -output-directory=${dir} ${filePath}`
        );

        // Check for errors in pdflatex execution
        if (stderr) {
            console.error(`pdflatex error: ${stderr}`);
            return;
        }

        // Move the generated PDF file to outputPdfPath
        const generatedPdfPath = path.join(dir, `${fileName}.pdf`);
        await fs.promises.rename(generatedPdfPath, outputPdfPath);

        console.log(`PDF generated successfully at: ${outputPdfPath}`);
    } catch (error) {
        console.error("Error:", error);
    }
};

const run = async (company, positionName) => {
    const inputFilePath = "document.tex";
    const texFile = "Rahat_Cover_Letter";
    const latexFilePath = path.join(__dirname, `${texFile}.tex`);

    await deleteFileIfExists(__dirname, `${texFile}.pdf`);

    await replaceTextInTex(
        inputFilePath,
        `${texFile}.tex`,
        company,
        positionName
    );

    await createPdfFromLatex(latexFilePath);

    await generateEmail(
        path.join(__dirname, "emailTemplate.txt"),
        path.join(__dirname, `./../Without pic/email.txt`),
        company,
        positionName
    );
};

const company = "Enosis Solutions";
const positionName = "Software Enginner";

run(company, positionName);
