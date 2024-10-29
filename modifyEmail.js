const fs = require("fs").promises;

exports.generateEmail = async(inputFilePath, outputFilePath, companyName, appliedPosition) => {
    try {
        let data = await fs.readFile(inputFilePath, "utf8");
        data = data
            .replace(/companyName/g, companyName)
            .replace(/appliedPosition/g, appliedPosition);
        await fs.writeFile(outputFilePath, data, "utf8");
        console.log("Email generated successfully at:", outputFilePath);
    } catch (err) {
        console.error("Error processing the file:", err);
    }
}

