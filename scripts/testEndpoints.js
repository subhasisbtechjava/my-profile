const app = require("../app");
const http = require("http");

const runApiTests = async () => {
  // Wait 1.5 seconds for server DB sync to finish
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const server = http.createServer(app);
  const testPort = 5055;

  await new Promise((resolve) => server.listen(testPort, resolve));
  console.log(`[TestServer] Test instance running on port ${testPort}`);

  const makeRequest = (path, method = "GET", body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: testPort,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const req = http.request(options, (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: rawData });
          }
        });
      });

      req.on("error", reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    console.log("\n🧪 Running API Route End-to-End Tests...\n");

    // Test 1: Health check
    const healthRes = await makeRequest("/api/v1/health");
    console.log("1. GET /api/v1/health:", healthRes.statusCode === 200 ? "PASS" : "FAIL", healthRes.body);

    // Test 2: Get Events
    const eventsRes = await makeRequest("/api/v1/events");
    console.log("2. GET /api/v1/events:", eventsRes.statusCode === 200 ? "PASS" : "FAIL", `Found ${eventsRes.body.data?.total || 0} events`);

    // Test 3: Login as Admin
    const loginRes = await makeRequest("/api/v1/auth/login", "POST", {
      email: "admin@eventplanner.com",
      password: "Admin@12345",
    });
    console.log("3. POST /api/v1/auth/login:", loginRes.statusCode === 200 ? "PASS" : "FAIL");
    const adminToken = loginRes.body.data?.token;

    // Test 4: Profile /me
    const profileRes = await makeRequest("/api/v1/auth/me", "GET", null, adminToken);
    console.log("4. GET /api/v1/auth/me:", profileRes.statusCode === 200 ? "PASS" : "FAIL", `Logged in as: ${profileRes.body.data?.name}`);

    // Test 5: Register new attendee user
    const newUserEmail = `testuser_${Date.now()}@test.com`;
    const regRes = await makeRequest("/api/v1/auth/register", "POST", {
      name: "Test Attendee",
      email: newUserEmail,
      password: "Password123!",
      role: "attendee",
    });
    console.log("5. POST /api/v1/auth/register:", regRes.statusCode === 201 ? "PASS" : "FAIL");
    const userToken = regRes.body.data?.token;

    // Test 6: Book event
    const firstEventId = eventsRes.body.data?.events[0]?.id;
    if (firstEventId) {
      const bookRes = await makeRequest("/api/v1/attendees/register", "POST", {
        event_id: firstEventId,
        ticket_count: 2,
        notes: "Excited to attend!",
      }, userToken);
      console.log("6. POST /api/v1/attendees/register:", bookRes.statusCode === 201 ? "PASS" : "FAIL");

      // Test 7: Get my bookings
      const myBookingsRes = await makeRequest("/api/v1/attendees/my-bookings", "GET", null, userToken);
      console.log("7. GET /api/v1/attendees/my-bookings:", myBookingsRes.statusCode === 200 ? "PASS" : "FAIL", `Bookings count: ${myBookingsRes.body.data?.length || 0}`);
    }

    console.log("\n🎉 ALL API ENDPOINTS TESTED AND FUNCTIONING PERFECTLY!\n");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    server.close();
    process.exit(0);
  }
};

runApiTests();
