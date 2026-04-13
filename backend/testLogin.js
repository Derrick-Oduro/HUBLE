const http = require("http");

const postData = JSON.stringify({
  email: "admin@huble.com",
  password: "Admin@123",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/admin/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("Testing login API endpoint...\n");

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    console.log("\nResponse Body:");
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));

      if (parsed.success) {
        console.log("\n✅ Login API is working!");
        console.log("Token received:", parsed.token ? "Yes" : "No");
      } else {
        console.log("\n❌ Login failed:", parsed.message);
      }
    } catch (e) {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error.message);
  console.log("\n💡 Make sure the server is running: npm start");
  process.exit(1);
});

req.write(postData);
req.end();
