const nodemailer = require("nodemailer");
const fs = require("fs");
const { success } = require("./success");

exports.sendEmail = async (positionName, companyEmail) => {
    try {
        const emailBody = fs.readFileSync("./../Without pic/email.txt", "utf8");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.userMail,
                pass: process.env.app_password,
            },
        });

        // console.log("app_password", process.env.app_password);

        const mailOptions = {
            // from: process.env.EMAIL_USER,
            to: companyEmail,
            subject: `Application for ${positionName} position`,
            text: emailBody,
            attachments: [
                {
                    filename: "Rahat_Cover_Letter.pdf",
                    path: "./../Without pic/Rahat_Cover_Letter.pdf",
                },
                {
                    filename: "Rahat_Resume.pdf",
                    path: "./../Without pic/Rahat_Resume.pdf",
                },
            ],
            headers: {
                "X-Priority": "1", // High priority (1 is the highest)
                Importance: "high", // Marks email as important
            },
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("\nEmail sent:", info.response);
        console.log(success(`Email sent to ${companyEmail} successfully ✔`));
    } catch (err) {
        console.error("Error sending email");
        console.log(err);
    }
};

// exports.sendEmail = async () => {
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         // console.log("Email sent:", info.response);
//     } catch (error) {
//         console.log("Error:", error);
//     }
// };
