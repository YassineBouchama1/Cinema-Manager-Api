const request = require('supertest');
const app = require('../../index');
const { userData } = require('../utils/authMockData');


describe('User API Endpoints', () => {
    describe('User Registration', () => {
        it('should register a user successfully', async () => {

            const response = await request(app)
                .post('/api/v1/auth/register') // endpoint
                .send(userData)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201); // expecting status
            expect(response.body).toHaveProperty('message', 'Created Account Successfully'); // Check the success message
            expect(response.body).toHaveProperty('data');
        });

        it('should return an error for duplicate email', async () => {
            const userData = {
                name: "yassine admin2",
                email: "sisko1@gmail.com",
                password: "pass123",
                passwordConfirm: "pass123",
                role: "user"
            };

            // first registration
            await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .set('Content-Type', 'application/json');

            // second registration with the same email
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400); // expection eror status 400

        });

        it('should return an error for missing fields', async () => {
            const userData = {
                name: "yassine admin2",
                email: "sisko1@gmail.com",
                password: "pass123",
                // passwordConfirm is missing
                role: "user"
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);

        });
    });
});
