import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();

// Get the current directory (__dirname equivalent in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.post("/submit", async (req, res) => {
  // Get the selected options from the request body
  const { option1, option2, option3, option4 } = req.body;
  if (!option1 || !option2 || !option3 || !option4) {
    // Log an error message and return a 400 Bad Request status
    console.error("Missing input values. All options are required.");
    return res
      .status(400)
      .send(
        "All options (Option1, Option2, Option3, Option4) must be selected."
      );
  }

  console.log(
    "Option1: " +
      option1 +
      " Option2: " +
      option2 +
      " Option3: " +
      option3 +
      " Option4: " +
      option4
  );
  const userInput =
    "Can you suggest a personalized diet plan for someone who prefers " +
    option1 +
    "," +
    option2 +
    "," +
    option3 +
    " and " +
    option4 +
    " ? In just 250 words.";

  try {
    // Generate content
    const result = await model.generateContent(userInput);
    const response = result.response;
    const text = response.text();
    const formattedResponse = formatResponse(text);
    // Send the formatted response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Result</title>
        <style>
          h1{
          text-align:center;
          }
          body{
          background-color: #d2c69d;
          text-align:center;
          }
          .output{
          text-align:left;
          line-height:1.6rem;
          background-color:white;
          font-size:1.2rem;
          padding:4%;
          margin:5%;
          border-radius:25%;
          }
          a{
          
          text-decoration:none;
          background: #231202;
          background-image: -webkit-linear-gradient(top, #423932, #3c2816);
          background-image: -moz-linear-gradient(top, #3f3b38, #25160a);
          background-image: -ms-linear-gradient(top, #362e27, #2f1e10);
          background-image: -o-linear-gradient(top, #3b2e23, #3d2a19);
          background-image: linear-gradient(to bottom, #0e0d0d, #432912);
          -webkit-border-radius: 28;
          -moz-border-radius: 28;
          border-radius: 28px;
          font-family: "Ubuntu";
          color: #ffffff;
          font-size: 18px;
          padding: 7px 20px 7px 20px;
          
          }
          a:hover{
          border:0.2rem solid rgba(0, 0, 0, 0.1);
          background: #292d2d;
          background-image: -webkit-linear-gradient(top, #304d4f, #314048);
          background-image: -moz-linear-gradient(top, #2d4e50, #414b51);
          background-image: -ms-linear-gradient(top, #4c5454, #515557);
          background-image: -o-linear-gradient(top, #445051, #384349);
          background-image: linear-gradient(to bottom, #434f50, #304049);
          text-decoration: none;
          }
        </style>

      </head>
      <body>
        <h1>Generated Diet Plan</h1>
        <div class="output">${formattedResponse}</div>
        <a href="/">Go Back</a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// Function to format the response into HTML
function formatResponse(text) {
  // Replace bold markers with HTML tags
  text = text.replace(/\*\*(.*?)\*\*/g, "<br><strong>$1</strong>"); // Convert **text** to <strong>

  // Split by sections (assuming each section starts with a keyword)
  const sections = text.split(/(?<=\*\*\w+:\*\*)/); // Split by bold section headers
  let html = "";

  sections.forEach((section) => {
    // Check if the section has a header
    const match = section.match(/^\*\*(.*?)\*\*:/);
    if (match) {
      const header = match[1]; // Extract the header
      const content = section.replace(/^\*\*.*?\*\*:/, "").trim(); // Remove header from the content
      html += `<h3>${header}</h3>`; // Add header

      // Create a list from the content
      const items = content
        .split(",")
        .map((item) => `<li>${item.trim()}</li>`)
        .join("");
      html += `<ul>${items}</ul>`; // Add the list
    } else {
      // Add remaining text as paragraphs
      html += `<p>${section.trim()}</p>`;
    }
  });

  return html;
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
