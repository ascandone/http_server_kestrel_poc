function Http$_parseUrl(pathname) {
  if (pathname === "/") {
    return [];
  }

  if (pathname[0] === "/") {
    pathname = pathname.slice(1);
  }

  return pathname.split("/");
}

function Http$_listFromArray(arr) {
  return arr.reduceRight(
    (prev, elem) => ({
      $: 1,
      _0: elem,
      _1: prev,
    }),
    List$Nil
  );
}

function Http$_arrayFromList(lst) {
  const arr = [];
  while (lst.$ !== 0) {
    arr.push(lst._0);
    lst = lst._1;
  }
  return arr;
}

function Http$_getBody(req) {
  return new Task$Task((resolve) => {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body).toString());
      });
  });
}

function Http$create_server(port, handler) {
  return new Task$Task(() => {
    const http = require("http");

    const server = http.createServer((req, res) => {
      let headers = Dict$empty;

      const parsedUrl = new URL(`http://localhost:${port}${req.url}`);

      const parsedPathname = Http$_listFromArray(
        Http$_parseUrl(parsedUrl.pathname)
      );

      const parsedParams = Http$_listFromArray([
        ...parsedUrl.searchParams.entries(),
      ]);

      const kestrelRequest = {
        specific: {
          method: req.method ?? "",
          url: parsedPathname,
          params: parsedParams,
        },
        headers,
        body: Http$_getBody(req),
      };

      const task = handler(kestrelRequest);

      Task$await(
        task,
        (kestrelResponse) =>
          new Task$Task(() => {
            const headersArr = Http$_arrayFromList(
              Dict$to_list(kestrelResponse.headers)
            );
            for (const header of headersArr) {
              res.setHeader(header._0, header._1);
            }
            res.statusCode = kestrelResponse.specific.status;
            res.flushHeaders();

            Task$await(
              kestrelResponse.body,
              (bodyString) =>
                new Task$Task((resolve) => {
                  res.end(bodyString);
                  resolve();
                })
            ).exec();
          })
      ).exec();
    });

    server.listen(port);
  });
}
