\# Food Delivery App



\## Project Overview

The Food Delivery App is a web-based application that allows users to view food items and manage food orders. It is developed using React, Spring Boot, and MySQL.



\## Technologies Used

\- Frontend: React.js, CSS

\- Backend: Java, Spring Boot

\- Database: MySQL

\- Containerization: Docker and Docker Compose

\- Version Control: Git and GitHub



\## Features

\- Display food items

\- View food prices and descriptions

\- Add, update, and delete food items through the backend API

\- REST API integration

\- MySQL database connectivity

\- Docker-based application setup



\## Project Structure

\- `food-frontend/` — React frontend

\- `backend/` — Spring Boot backend

\- `compose.yaml` — Docker Compose configuration



\## Run with Docker

1\. Install Docker Desktop.

2\. Create a `.env` file in the project root.

3\. Add your local MySQL root password:



&#x20;  `MYSQL\_ROOT\_PASSWORD=your\_local\_password`



4\. Build and start the application:



&#x20;  `docker compose up --build -d`



5\. Open the application:

&#x20;  - Frontend: http://localhost:5174

&#x20;  - Backend API: http://localhost:8081/api/foods



\## Stop the Application

Run:



`docker compose down`



\## Repository

https://github.com/24eg104b46-glitch/food-delivery-app

