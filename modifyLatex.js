const { DateTime } = require("luxon");
const path = require("path");
const fs = require("fs").promises;

exports.replaceTextInTex = async (
    inputFilePath,
    outputFilePath,
    companyName,
    appliedPosition
) => {
    try {
        const currentDate = DateTime.now()
            .setZone("Asia/Dhaka")
            .toFormat("MMMM dd, yyyy");

        let data = await fs.readFile(inputFilePath, "utf8");

        data = data
            .replace(/companyName/g, companyName)
            .replace(/currentDate/g, currentDate)
            .replace(/appliedPosition/g, appliedPosition);

        // Write the updated content to the output file
        await fs.writeFile(outputFilePath, data, "utf8");
        // console.log("Output file created successfully!");
    } catch (err) {
        console.error("Error processing the file:", err);
    }
};

exports.deleteFileIfExists = async (directory, fileName) => {
    try {
        const filePath = path.join(directory, fileName);
        console.log("\n\n----------");
        console.log(filePath);

        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(
            `----------- File ${fileName} deleted successfully -----------`
        );
    } catch (err) {
        if (err.code === "ENOENT") {
            // console.log(`File ${fileName} does not exist in the directory.`);
        } else {
            console.error("Error deleting the file:", err);
        }
    }
};
