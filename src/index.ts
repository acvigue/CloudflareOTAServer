import { Hono } from "hono";
import latestSemver from "latest-semver";

type AppEnv = {
  r2: R2Bucket;
};

type ProjectConfig = {
  firmware_name: string;
  filesystem_name: string;
};

const app = new Hono<{ Bindings: AppEnv }>();

app.get("/", (c) => c.redirect("https://www.youtube.com/watch?v=FfnQemkjPjM"));

app.get("/:project/:version/:fstype", async (c) => {
  const version = c.req.param("version");
  const fstype = c.req.param("fstype");
  const project = c.req.param("project");

  const objectName = `${project}/${version}/${fstype}.bin`;

  const object = await c.env.r2.get(objectName);
  if (object === null) {
    return c.json({ error: "not_found", object: objectName }, 404);
  }

  const objectContent = await object.arrayBuffer();
  c.header("Cache-Control", "max-age=31536000");
  c.header("Content-disposition", `attachment; filename=${fstype}.bin`);
  c.header("Content-Type", "application/octet-stream");
  return c.body(objectContent);
});

app.get("/:project/manifest", async (c) => {
  const project = c.req.param("project");

  const projectConfigFile = await c.env.r2.get(`${project}/config.json`);
  if (!projectConfigFile) {
    return c.json({ error: "no_such_project" }, 404);
  }
  const projectConfig = JSON.parse(await projectConfigFile.text()) as ProjectConfig;

  const firmwareObjects = await c.env.r2.list({
    prefix: project,
  });

  let objectNames = firmwareObjects.objects.map((object) => object.key);
  objectNames = objectNames.filter((v) => {
    if (v.includes(".bin") || v === `${project}/`) {
      return false;
    }
    return true;
  });
  objectNames = objectNames.map((value) => {
    return value.split("/")[1];
  });
  objectNames = [...new Set(objectNames)];

  const url = new URL(c.req.url);
  const version = latestSemver(objectNames);

  if (!version) {
    return c.json({ error: "semver_err" }, 500);
  }

  return c.json({
    type: project,
    version: version,
    host: url.hostname,
    port: 443,
    bin: `/${project}/${version}/${projectConfig.firmware_name}`,
    spiffs: `/${project}/${version}/${projectConfig.filesystem_name}`,
  });
});

export default app;
