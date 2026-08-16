# COMP-440-Course-Project
Group Project for COMP 440 Database Design

Andrei David
    - Implemented Part 1 - Item Management
    - Implemented Part 2 - Category Management
    - Implemented SQL Query 4-6
    

Juan Aguilar
    - Implemented Part 3 - Review Management
    - Implemented review display functionality
    - Implemented SQL Query 1-3
    - Implemented SQL Query interface

Youtube link: https://youtu.be/se7UFob2hhE

If you would like to try please follow the instructions below.

# Software Requirements

You will need to install the following:

    Node.js
    MySQL Server
    MySQL Workbench
    A web browser

The project uses the following Node.js packages:

    "bcrypt": "^6.0.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "mysql2": "^3.23.2"

Run the following commands inside your terminal to install:

    npm install bcrypt
    npm install dotenv
    npm install express
    npm install mysql

# Database Setup

Inside mySql workbench, create a database using our schema.sql

For example:

    CREATE DATABASE comp440

Then select the database:

    USE comp440;

Run the `schema.sql` file to create all of the required tables,
constraints, and triggers.

The database contains the following tables:

- users
- items
- categories
- item_categories
- reviews

# Environment Configuration

Create a file called ".env" and fill out the following:
    DB_HOST=localhost
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    DB_PORT=3306
    PORT=3000

Enter your own MySQL username, password, and database name.

# Running the Application

Once completed, run the following command to start the server:
    node .\server\

Navigate to the following site to see the front end:
    http://localhost:3000/index.html

