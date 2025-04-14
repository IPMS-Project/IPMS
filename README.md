# Module 4: Coordinator Email Approval and Reject Functionality

![Screenshot 2025-04-14 180719](https://github.com/user-attachments/assets/f066951a-a6f2-49e3-af6c-2d071ab144ee)

![Screenshot 2025-04-14 180848](https://github.com/user-attachments/assets/30f9ac75-b431-445a-9279-a4c823d7513c)

![Screenshot 2025-04-14 180918](https://github.com/user-attachments/assets/4e22d876-8b8b-49cd-8a05-8c165aa0ae48)

![Screenshot 2025-04-14 180941](https://github.com/user-attachments/assets/d102eca5-1d33-4b1c-8e4e-96d2cc7abd19)

![Screenshot 2025-04-14 181014](https://github.com/user-attachments/assets/742500dc-c8b3-4e77-8d6c-f2bc01f8d155)

---

## verifying email sent

---
![Screenshot 2025-04-14 182557](https://github.com/user-attachments/assets/58d15afa-405e-4718-bf1e-95a45991f4b2)

![Screenshot 2025-04-14 182623](https://github.com/user-attachments/assets/058826ce-5855-42b8-a524-11be03c1369e)










# IPMS Project - Environment Setup

![image](https://github.com/user-attachments/assets/2ac4e0b2-0bbe-4656-b0b9-fe5e0dc0ab09)

---

## Installation and Setup

### Step 1: Install Prerequisites

#### Required Software:

- **Git**: Install Git on your local machine.
- **Node.js**: Install Node.js (preferably the LTS version).

---

### Step 2: Clone the Repository

#### Create a Folder:

- Create a folder named `IPMS` on your local machine.

#### Clone the Repository:

- Open the Command Prompt (CMD), navigate to the `IPMS` folder, and run:

  ```bash
  git clone https://github.com/IPMS-Project/IPMS.git
  ```

---

### Step 3: Explore the Repository

#### Repository Structure:

- After cloning, you will see the `client` and `server` folders under the `IPMS` directory.

#### Open in Visual Studio Code:

- Open the `IPMS` folder in **Visual Studio Code**.

---

### Step 4: Install Dependencies

#### Install via npm:

- Open terminals for both `client` and `server` folders.
- Run the following command in each folder:

  ```bash
  npm install
  ```

- After installation, a `node_modules` folder will appear in both `client` and `server` directories.

---

### Step 5: Run the Server

#### Start the Server:

- Navigate to the `server` folder and run:

  ```bash
  npm start
  ```

- This will start the server and connect to MongoDB.

---

### Step 6: Run the Client

#### Launch the Client Application:

- Navigate to the `client` folder and run:

  ```bash
  npm start
  ```

- This will open a page on **port 3000**.
- The displayed page is a sample page to verify that the client is running (not the final product).

---

## Troubleshooting

### Common Issue: Failed to Create User

- If you see a `"Failed to create user"` error, the **server might not be running**.
- Ensure the server is started before trying to create a user.

---

### Step 7: Set Up Local MongoDB

#### Install MongoDB:

- Download and install MongoDB Community Edition from [here](https://www.mongodb.com/try/download/community).
- Follow the installation instructions for your operating system.
- Make sure the MongoDB service is running.

#### Database Details:

- The project uses a local MongoDB database.
- Default connection string: `mongodb://localhost:27017/IPMS`

#### Database Management Tool:

- Download and install Studio 3T from [here](https://studio3t.com/download/).
- Open Studio 3T and create a new connection to `mongodb://localhost:27017`.
- Use Studio 3T to view, query, and manage your database.

---

## Notes:

- Follow the steps carefully to set up your environment.
- If you encounter issues, refer to the troubleshooting section.
- Ensure you are working on the latest version of the repository.

---

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing and deployment. The workflow is configured in `.github/workflows/main.yml`.

#### What the Workflow Does:

1. **Continuous Integration (CI)**:

   - Runs on every push to main branch and pull requests
   - Installs dependencies for both frontend and backend
   - Builds the frontend application
   - Verifies that both frontend and backend can be built successfully

2. **Continuous Deployment (CD)**:
   - Automatically deploys to the server when changes are pushed to main
   - Only runs on pushes to main (not on pull requests)
   - Deploys both frontend and backend code
   - Restarts the application on the server

#### How to Use:

1. **For Regular Development**:

   - Create a new branch for your feature/devlopment
   - Make your changes
   - Create a pull request to feature/devlopment
   - now review all the changes and merge into feature branch
   - Create a pull request to main from feature branch
   - The CI workflow will run automatically to verify your changes
   - **Important**: Always keep your branch updated with the latest changes from the target branch before creating a pull request:
     ```bash
     git checkout your-branch
     git fetch origin
     git merge origin/feature # or origin/main
     # Resolve any conflicts and then push
     git push origin your-branch
     ```

2. **For Deployment**:
   - Push your changes to main
   - The CD workflow will automatically deploy to the server

#### Required GitHub Secrets:

The following secrets need to be set up in your GitHub repository:

- `SERVER_HOST`: Server IP address or hostname
- `SERVER_USERNAME`: SSH username
- `SERVER_PASSWORD`: SSH password
- `PROJECT_PATH`: Path to project on server

To set up secrets:

1. Go to your GitHub repository
2. Click "Settings"
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with its corresponding value

#### Troubleshooting CI/CD:

- If the workflow fails, check the "Actions" tab in your repository
- Common issues:
  - Missing dependencies in package.json
  - Build errors in the frontend
  - Server connection issues
  - Incorrect server credentials

---
