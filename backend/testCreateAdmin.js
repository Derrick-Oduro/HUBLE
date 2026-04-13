const http = require("http");

const data = JSON.stringify({
  username: "admin",
  email: "admin@huble.com",
  password: "Admin@123",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/admin/auth/create-first-admin",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", responseData);
    process.exit(0);
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
  process.exit(1);
});

req.write(data);
req.end();
