# COMP-440-Course-Project
Group Project for COMP 440 Database Design
Andrei David
Juan Aguilar

Youtube link:

If you would like to try please follow the instructions below.

You will need to install the following:
    "bcrypt": "^6.0.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "mysql2": "^3.23.2"

Run the following commands inside your terminal to install:
    npm install bcrypt
    npm install dotenv
    npm install express
    npm install mysql

Inside mySql workbench, create a database using our schema.sql

Create a file called ".env" and fill out the following:
    DB_HOST=localhost
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    DB_PORT=3306
    PORT=3000

Once completed, run the following command to start the server:
    node .\server\

Navigate to the following site to see the front end:
    http://localhost:3000/index.html