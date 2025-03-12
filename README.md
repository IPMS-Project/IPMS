# IPMS Project - Environment Setup

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
  node index.js
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

### Step 7: Verify MongoDB Data

#### Install Studio 3T:
- Download and install **Studio 3T** from [here](https://studio3t.com/download/).

#### Database Details:
- The database is hosted on **MongoDB Atlas**, allowing team members to work collaboratively.

---

### Step 8: Connect to MongoDB Atlas Using Studio 3T

#### Steps to Connect:
1. Open **Studio 3T**.
2. Click on **Connect** → **New Connection**.
3. Enter the following connection string:

   ```
   mongodb+srv://IPMS_USER:SEP_SPRING2025@ipms-cluster.os34l.mongodb.net/IPMS?retryWrites=true&w=majority&appName=IPMS-Cluster
   ```

4. Click **Save and Connect**.

---

## Notes:
- Follow the steps carefully to set up your environment.
- If you encounter issues, refer to the troubleshooting section.
- Ensure you are working on the latest version of the repository.

---

