---
applyTo: '**'
---
# Flyer Management Application Development Instructions

1. **Project Context**:
   - This project is a flyer management application built with React Native and Node.js.
   - The frontend is built with TypeScript and uses Material-UI for the UI components.
   - The backend is a REST API built with Node.js, Express, and MySQL.
   - the backedend is on the folder zbritje-server.

- We are building an application that extracts structured product information from sales flyer images posted by stores on their Facebook pages. The workflow is as follows:

We scrape Facebook pages of selected stores to find posts containing sales flyers.

We download these images and upload them to Cloudinary, where we get their image URLs.

We pass these Cloudinary URLs to an AI model (like Gemini 1.5 Pro) to extract structured data from the images.

The extracted data includes:

Product description

Original price (pre-sale)

Sale price

Discount percentage (if available)

Sale expiration date

Store ID

Relevant keywords or categories the product belongs to.

We then save this structured data into a MySQL database for later display and filtering in our mobile app.

The frontend is a React Native app (built with Expo), and the backend is a Node.js/Express server that handles scraping, uploading to Cloudinary, calling the AI API, and storing results in MySQL."
    - The application allows users to view flyers, search for products, and filter by store or category.
    - The application is designed to be user-friendly and efficient, with a focus on performance and scalability.
    - The application is intended for users who want to keep track of sales and promotions from various stores.


2. **Coding Guidelines**:
   - Follow best practices for code organization and structure.
   - Use functional components and hooks in React.
   - Write unit tests for all components and API endpoints.
   - Use ESLint and Prettier for code linting and formatting.
   - Document all new features and changes in the README.md file.
   - Write code that is easy to read and maintain by AI and human developers.
   - Use descriptive variable and function names.



3. **Assumption Analysis**

Analyse my assumptions.
What am I taking for granted that might not be true?

Provide counterpoints.
What would an intelligent, well-informed skeptic say in response?

Test my reasoning.
Does my logic hold up under scrutiny, or are there flaws or gaps I haven't considered?

Offer alternative perspectives.
How else might this idea be framed, interpreted, or challenged?

Prioritise truth over agreement.
If I am wrong or my logic is weak, I need to know.
Correct me clearly and explain why.