## fake azure device code login webserver

this was written for my job so that i could have an emulation of running kubelogin.exe in a `-login devicecode` context.
> must run with the `--disable-instance-discovery` flag.

## how it works

long story short: i forced gemini to check the requests being made to the webserver when i ran `kubelogin.exe` against the ip.

### webserver

it is important to note that `kubelogin.exe` requires that authority hosts be `https`, therefore, for this, we rely on `caddy` to make a reverse-proxy.

we start a webserver on `localhost:3001` as http and then start a reverse proxy which serves it on `localhost:3000` as **https**.

### requests


gemini accepts functionally all requests, but appropriately fulfills json's in the format they are required to be by `kubelogin.exe`.

it correctly implements the `device_code` standard, and serves back a token that expires in one hour. the `access_token` field is a random JWT.


## how to run

please only execute the server through npm as such:

```bash
> npm run fake-azure
```

this will run a powershell script that also starts the reverse-proxy **caddy** server and kills it when you SIGINT.


## usage example

```bash
> kubelogin.exe get-token --login devicecode `
∙   --server-id sid `
∙   --client-id cid `
∙   --tenant-id custom `
∙   --authority-host https://127.0.0.1:3000/ `
∙   --disable-instance-discovery
To sign in, use a web browser to open the page https://127.0.0.1:3000/device.
{"kind":"ExecCredential","apiVersion":"client.authentication.k8s.io/v1beta1","spec":{"interactive":false},"status":{"expirationTimestamp":"2026-01-07T03:47:48Z","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsIjoiZGF0YSIsImlhdCI6MTc2Nzc1NDA2OH0.duIHauMrsHh4Fj2MtRZ-Ya1tU4mwR4PZrWAypTdUt4g"}}
```
