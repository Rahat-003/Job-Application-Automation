require("dotenv").config();
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(exec);
const { replaceTextInTex, deleteFileIfExists } = require("./modifyLatex");
const { generateEmail } = require("./modifyEmail");
const { success } = require("./success");

const checkEmptyString = (name) => {
    if (!name || name === "") return false;
    return true;
};

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

const companyEmail = process.argv[2];
const company = process.argv[3];
const positionName = process.argv[4];

console.log("Company:", company);
console.log("Position Name:", positionName);

const { sendEmail } = require("./sendEmail");

const generateCoverLetterAndSendMail = async () => {
    if (
        checkEmptyString(company) &&
        checkEmptyString(positionName) &&
        checkEmptyString(companyEmail)
    ) {
        await run(company, positionName);
        await sendEmail(positionName, companyEmail);
    } else {
        const clipboard = 'node index.js "" "" ""';
        console.error("\n\t\tGive following command in terminal");
        console.warn(
            '\t\tnode index.js "companyEmail" "companyName" "appliedPosition"'
        );

        console.log(success(clipboard));
        // console.log(
        //     '\x1b[1m\x1b[32m\t\tnode index.js "" "" ""\x1b[39m\x1b[22m\n'
        // );
    }
};

async function main() {
    console.time("Timer");
    // Await the completion of the async function
    await generateCoverLetterAndSendMail();
    console.timeEnd("Timer");
    console.log("\n");
}

main();