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
            // `pdflatex -interaction=nonstopmode -output-directory="${dir}" "${filePath}"`
        );
        // console.log("pdflatex stdout:", stdout);
        // console.error("pdflatex stderr:", stderr);
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

function escapeLatexSpecialChars(input) {
    // Define a map for the special characters and their escaped versions
    const specialChars = {
        "#": "\\#",
        $: "\\$",
        "%": "\\%",
        "&": "\\&",
        _: "\\_",
        "{": "\\{",
        "}": "\\}",
        "~": "\\textasciitilde", // '~' has a special meaning in LaTeX
        "^": "\\textasciicircum", // '^' is used for superscript in LaTeX
        "\\": "\\textbackslash",
    };

    // Iterate over the input string and replace special characters with their escaped versions
    return input.replace(/[#$%\&_\{\}~^\\]/g, (match) => specialChars[match]);
}

const run = async (company, positionName) => {
    const inputFilePath = "document.tex";
    const texFile = "Rahat_Cover_Letter";
    const latexFilePath = path.join(__dirname, `${texFile}.tex`);

    // await deleteFileIfExists(__dirname, `${texFile}.pdf`);
    // console.log({ latexFilePath });
    await replaceTextInTex(
        inputFilePath,
        `${texFile}.tex`,
        escapeLatexSpecialChars(company),
        escapeLatexSpecialChars(positionName)
    );

    await createPdfFromLatex(latexFilePath);

    await generateEmail(
        path.join(__dirname, "emailTemplate.txt"),
        path.join(__dirname, `./../Without pic/email.txt`),
        company,
        positionName
    );
};

const company = process.argv[2];
const positionName = process.argv[3];
const companyEmail = process.argv[4];

console.log("Company:", company);
console.log("Position Name:", positionName);

const { sendEmail } = require("./sendEmail");

const generateCoverLetterAndSendMail = async () => {
    if (checkEmptyString(company) && checkEmptyString(positionName)) {
        await run(company, positionName);
        if (checkEmptyString(companyEmail)) {
            await sendEmail(positionName, companyEmail);

            const data = `\nnode index.js "${company}" "${positionName}" "${companyEmail}"`;
            fs.appendFileSync("./sendMultipleMail.txt", data, "utf8");
        }
    } else {
        const clipboard = 'node index.js "" "" ""';
        console.error("\n\tGive following command in terminal");
        console.warn(
            '\tnode index.js "companyName" "appliedPosition" "companyEmail"'
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
    console.log();
}

main();