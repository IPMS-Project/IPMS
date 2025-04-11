# Internship Program Management System (IPMS)

## 📋 A.3 Job Performance Evaluation Form

This module allows internship advisors and coordinators to fill out an evaluation form with:

- Performance ratings (Satisfactory / Unsatisfactory)
- Comments per category
-  Digital signature support (drawn or typed)

---

##  How to Run This App (Frontend Only)

1. Open terminal and navigate to the root of the project.

2. Move into the React frontend folder:

```bash
cd client
```

3. Install all required frontend dependencies:

```bash
npm install
```

This installs:
- `react`
- `react-bootstrap`
- `bootstrap`
- `react-signature-canvas`  
*(These are declared in `client/package.json`)*

4. Start the React development server:

```bash
npm start
```

---

## 🌐 Open in Your Browser

After `npm start`, your browser will open to:

```
http://localhost:3000/
```

 **Change the URL to:**

```
http://localhost:3000/evaluation
```

This will load the **A.3 Job Performance Evaluation Form** page.

---

##  Dependencies Used

These libraries are already included in the project:

| Library                | Purpose                    |
|------------------------|----------------------------|
| `react-bootstrap`      | UI components              |
| `bootstrap`            | Styling and layout         |
| `react-signature-canvas` | Signature input support |
| `react-router-dom`     | Routing between pages      |

---

## 💡 Notes for New Developers

- You **must run `npm install` inside the `client/` folder**.
- You **do not need to install anything globally or separately**.
- If you run from the root folder, be sure to `cd client` before installing or starting.

---

📝 Viewing Signatures from the Database

If you're checking stored evaluation data in a database tool (like Studio 3T), you might see a Base64 string under the signature field. It looks something like this:
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAACWCAYAA..."

👉 How to View the Drawn Signature:

Right-click the value field in the database view.
Choose Copy → Copy Value.
Paste the copied string into your web browser’s address bar.
Important: Remove the surrounding double quotes (") before hitting Enter.
The browser will render and display the signature image.


## File Structure (Frontend)

```
client/
├── public/
├── src/
│   ├── pages/
│   │   └── A3JobEvaluationForm.jsx
│   ├── styles/
│   │   └── A3JobEvaluationForm.css
│   ├── index.js
│   └── App.js / router.js
├── package.json
└── README.md
```

---

##  You're all set!

If you follow the steps above, the evaluation form should be up and running — no additional setup needed.

For help, contact the module owner or contributor who integrated the evaluation form.
