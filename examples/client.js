(async function () {
  const res = await fetch("http://localhost:8000");
  console.log("STATUS =>", res.status);

  for await (const data of res.body) {
    console.log("received: ", data.toString("utf-8"));
  }

  console.log("done");
})();
