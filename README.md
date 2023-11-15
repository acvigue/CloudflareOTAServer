# Cloudflare OTA Server

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![CodeFactor](https://www.codefactor.io/repository/github/acvigue/cloudflareotaserver/badge)](https://www.codefactor.io/repository/github/acvigue/cloudflareotaserver)

Host OTA updates for all your projects using Cloudflare Workers and R2

## Deployment

Use wrangler to create a R2 bucket, bind it using `wrangler.toml` and deploy it to your zone.

## Configuration

Each folder inside of the configured R2 bucket is considered a "project" with a `config.json` file. Folders in this project directory are considered versions and MUST be named in semver notation ex. 2.1.3

OTA server supports serving both FS and firmware, and is meant to be consumed by esp32FOTA. 

## Authors

- [@acvigue](https://www.github.com/acvigue)

