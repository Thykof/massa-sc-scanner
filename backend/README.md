# Mass Sc Scanner - Backend

## Deploy to Clever Cloud

Set the environment variables.

Select size XS: 1CPU, 1 GB RAM.

## Deploy into a VPS

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

Create a `default.conf` file in the `nginx` directory. This file will configure NGINX to reverse proxy requests to your NestJS app.

```nginx
server {
    listen 80;

    server_name your_domain.com;

    location / {
        proxy_pass http://app:3000; # 'app' is the name of the NestJS service in docker-compose
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

In the `nginx` directory, create a `Dockerfile` for the NGINX setup:

```dockerfile
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
```

```bash
sudo apt install ufw
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```
