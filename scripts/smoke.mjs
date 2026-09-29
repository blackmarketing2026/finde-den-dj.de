import assert from "node:assert/strict";

const base = process.env.API_URL || "http://localhost:3001/api";
async function call(path, method = "GET", body, cookie) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
const suffix = Date.now();
const inquiry = await call("/inquiries", "POST", {
  name: "Test Veranstalter",
  email: `test-${suffix}@example.test`,
  event_type: "Hochzeit",
  genres: ["House", "Disco"],
  city: "Berlin",
  event_date: "2027-07-17",
  guests: 80,
  budget: 1200,
  wishes: "Tanzbare Musik",
  consent: true,
  website: "",
});
assert.equal(inquiry.status, 201);
const token = inquiry.data.token;
const before = await call("/inquiries/" + token);
assert.equal(before.status, 200);
assert.equal(before.data.offers.length, 0);
assert.ok(before.data.matches.some((x) => x.stage_name === "Maya Sol"));
const login = await call("/auth/login", "POST", {
  email: "maya@djkompass.local",
  password: process.env.DJ_DEMO_PASSWORD || "demo12345",
});
assert.equal(login.status, 200);
const djRequests = await call("/dj/inquiries", "GET", null, login.cookie);
assert.ok(djRequests.data.some((x) => x.id === inquiry.data.id));
const offer = await call(
  `/dj/inquiries/${inquiry.data.id}/respond`,
  "POST",
  {
    status: "sent",
    price: 1100,
    scope: "DJ-Set für 6 Stunden inklusive Licht",
    message:
      "Ich freue mich auf eure Feier und stimme die Musik gern mit euch ab.",
  },
  login.cookie,
);
assert.equal(offer.status, 200);
const after = await call("/inquiries/" + token);
assert.equal(after.data.offers.length, 1);
const admin = await call("/auth/login", "POST", {
  email: process.env.ADMIN_EMAIL || "admin@djkompass.local",
  password: process.env.ADMIN_PASSWORD || "change-this-before-deployment",
});
assert.equal(admin.status, 200);
const overview = await call("/admin/overview", "GET", null, admin.cookie);
assert.equal(overview.status, 200);
assert.ok(overview.data.offers.some((x) => x.inquiry_id === inquiry.data.id));
console.log(
  "Smoke-Test erfolgreich: Anfrage, Matching, DJ-Angebot, Vergleich und Admin-Einsicht.",
);
