const request = require("supertest");
const app = require("../src/app");

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    test("Should register a new user", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    test("Should not register user with invalid email", async () => {
      const userData = {
        username: "testuser2",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /health", () => {
    test("Should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body.message).toBe("HUBLE API is running");
    });
  });
});
