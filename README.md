
## Setup command

```bash

studio-cli setup \n
    --hid-net-rpc "https://rpc.jagrat.hypersign.id/" \n
    --hid-net-rest "https://api.jagrat.hypersign.id/" \n
    --mnemonic "parade erase firm goose old elegant sausage sweet stuff view goddess total museum hidden worry usual rug foster uncover cradle govern swing muscle unable" \n
    --jwt-secret "76JpMGuSf0ejzi4OFHpe" \n

```
----------------------------------------------------------------

```bash
studio-cli setup \n
> Enter Hid-node RPC endpoint:
    "https://rpc.jagrat.hypersign.id/"
> Enter hid-node REST endpoint:
    "https://api.jagrat.hypersign.id/"
> Enter a mnemonic: 
    "parade erase firm goose old elegant sausage sweet stuff view goddess total museum hidden worry usual rug foster uncover cradle govern swing muscle unable"
> Set a JWT_SECRET: 
    "76JpMGuSf0ejzi4OFHpe"

```
----------------------------------------------------------------

> After taking all these input from users, generate docker compose file

## Run Issuer node

```bash
studio-cli start --p 3001
```

> This will run the issuer node at port 3001 in form of docker


