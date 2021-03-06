const path = require('path');
const fs = require('fs');
const ini = require('ini');
const npmConf = require('npm-conf')();
const matchAll = require('match-all');
const request = require('../request');
const { getProjectRoot } = require('../utils');

const GLOBAL_CONFIG = npmConf.get('globalconfig');
const USER_CONFIG = npmConf.get('userconfig');

function parseNpmrc(directory) {
  const PROJECT_CONFIG = path.join(directory, '.npmrc');

  if (fs.existsSync(PROJECT_CONFIG)) {
    const npmrc = fs.readFileSync(PROJECT_CONFIG, 'utf-8');

    return ini.parse(npmrc);
  } else if (fs.existsSync(USER_CONFIG)) {
    const npmrc = fs.readFileSync(USER_CONFIG, 'utf-8');

    return ini.parse(npmrc);
  } else if (fs.existsSync(GLOBAL_CONFIG)) {
    const npmrc = fs.readFileSync(GLOBAL_CONFIG, 'utf-8');

    return ini.parse(npmrc);
  }
}

function getRegistries(directory) {
  const npmrc = parseNpmrc(directory);
  const registries = [];

  for (const config in npmrc) {
    if (/@(.*):registry/gi.test(config)) {
      const scope = matchAll(config, /@(.*):registry/gi).toArray()[0];
      const registryConfig = registries.find((rConfig) => {
        return rConfig.registry === npmrc[config];
      });

      if (registryConfig) {
        registryConfig.scopes.push(`@${scope}`);
      } else {
        registries.push({
          scopes: [`@${scope}`],
          registry: npmrc[config],
        });
      }
    } else if (config === 'registry') {
      registries.push({
        scopes: [],
        registry: npmrc[config],
      });
    } else if (/\/\/(.*)\/:(_authToken|_auth)/gi.test(config)) {
      const registry = matchAll(
        config,
        /\/\/(.*)\/:(_authToken|_auth)/gi
      ).toArray()[0];
      const registryConfig = registries.find((rConfig) => {
        const registryURL = new URL(rConfig.registry);

        return registryURL.host === registry;
      });

      if (registryConfig) {
        registryConfig.token = npmrc[config];
      }
    }
  }

  return registries;
}

function getLatestVersion(packageName, directory = process.cwd()) {
  let npmRegistryURL = 'https://registry.npmjs.org';
  const projectRoot = getProjectRoot(directory);
  const registries = getRegistries(projectRoot || directory);
  const [scope] = packageName.split('/');
  const registryConfig = registries.find((rConfig) =>
    rConfig.scopes.includes(scope)
  );
  let headers = {};

  if (registryConfig && registryConfig.registry) {
    npmRegistryURL = registryConfig.registry;
    if (registryConfig.token) {
      headers = {
        Authorization: `Bearer ${registryConfig.token}`,
      };
    }
  }

  return new Promise((resolve, reject) => {
    request
      .get(`${npmRegistryURL}/${packageName}`, headers)
      .then(({ body: packageInfo, response }) => {
        if (response.statusCode === 200) {
          resolve(JSON.parse(packageInfo)['dist-tags']['latest']);
        } else {
          reject(JSON.parse(packageInfo));
        }
      });
  });
}

module.exports = {
  getRegistries,
  getLatestVersion,
};
