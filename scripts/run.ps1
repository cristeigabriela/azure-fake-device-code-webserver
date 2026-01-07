# only run through npm!

# start caddy reverse proxy for https.
# runs in background and closes when script closes.
$x = Start-Process -FilePath caddy.exe -ArgumentList ("reverse-proxy --from 127.0.0.1:3000 --to 127.0.0.1:3001 --internal-certs" -split " ")

# when we receive ctrl-c from user
Register-EngineEvent PowerShell.Exiting -Action {
    if (!$x.HasExited) {
        Write-Host 'exiting caddy...'
        $x.Kill()
    }
}

# start the webserver
& node.exe .\index.js