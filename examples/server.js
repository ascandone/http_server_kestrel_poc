const http = require("node:http");

const server = http.createServer(async (req, res) => {
  res.writeHead(200);
  res.flushHeaders();

  await delay(200);
  res.write("m1");
  res.on("drain", () => {
    console.log("DRAIN");
  });
  await delay(200);
  res.write("m2");

  await delay(200);
  res.end();
});

function delay(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

console.log("listening on http://localhost:8000");

server.listen(8000);
