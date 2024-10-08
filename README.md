# Cinema Manager API

**Cinema Manager API** is a RESTful API designed to manage cinema operations, including films, reservations, auditoriums, screenings, and user accounts. The API allows administrators to create user accounts and enables authenticated clients to make reservations.

## Project Overview

This project aims to streamline cinema management processes for administrators and enhance user experience for clients through a robust API.

## Architecture

- **Model**: Handles database queries.
- **Controller**: Manages business logic and request processing.
- **Route**: Defines API endpoints following the pattern: `http://localhost:3000/[route]`.
- **Util**: Contains reusable utility functions.
- **Validators**: 
  - Contains validation logic for incoming requests to ensure data integrity.
  - Uses libraries such as `express-validator` to validate and sanitize user inputs.
- **Test**: 
  - Contains unit and end-to-end (e2e) tests for various components of the API.
  - **Unit Tests**: Test individual functions and components for expected behavior.
  - **E2E Tests**: Test the complete flow of the API, ensuring that different parts of the system work together correctly.

## Main Features

- **User Management**:
  - Client registration and authentication using JWT.
  - Administrators can create, modify, or delete accounts.

- **Film Management**:
  - Administrators can add, modify, or delete films.
  - Clients and admins can view available films.

- **Screening Management**:
  - Create and manage auditoriums and screenings.
  - Check availability and schedule sessions.

- **Reservation Management**:
  - Clients can reserve seats post-authentication.
  - Confirmation and details sent via email.

## Postman Endpoints

For testing the API, use the Postman collection:
[Postman Endpoints](https://documenter.getpostman.com/view/27177371/2sAXqy1dxm)



## Getting Started

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/YassineBouchama1/Cinema-Manager-Api.git]

2. **Install Dependencies**
   ```cd [project-directory]
   npm install
   
3. **Create Environment File**
   ```cp .env.example .env
   Open the .env file and add your specific values for the environment variables.

4. **Run the Application**
   ```npm start