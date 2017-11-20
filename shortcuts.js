const {statSync, readFileSync} = require("fs");
const path = require("path");
const ws = require("windows-shortcuts");
const platform = require("rise-common-electron").platform;
const launcherUtils = require("./utils/launcher-utils.js");
const programsDirectory = platform.isWindows() ?
  path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs") :
  path.join(process.env.HOME, ".local", "share", "applications");
const autostartPath = platform.isWindows() ?
  path.join(programsDirectory, "Startup", "Rise Vision Player.lnk") :
  path.join(process.env.HOME, ".config", "autostart", "rvplayer.desktop");

function checkShortcut(shortcut) {
  if (platform.isWindows()) {
    return checkWindowsShortcut(shortcut.windows);
  } else {
    return checkLinuxShortcut(shortcut.linux)
  }
}

function checkScriptExists(script) {
  try {
    statSync(script);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject();
  }
}

function escapeStringRegex(s) {
  return s.replace(/\./g, '\\.');
}

function checkWindowsShortcut(shortcut) {
  return new Promise((res, rej) => {
    ws.query(shortcut.location, (err, result) => {
      if (
        !err &&
        shortcut.target === result.target &&
        // Don't check args if shortcut.args is undefined
        (!shortcut.args || shortcut.args === result.args)
      ) {
        res();
      } else {
        rej();
      }
    });
  });
}

function checkLinuxShortcut(shortcut) {
  let fileContents;
  const nameRegex = RegExp(`\\n\\s*Name=${escapeStringRegex(shortcut.name)}`);
  const targetRegex = RegExp(`\\n\\s*Exec=${escapeStringRegex(shortcut.target)}`);
  return new Promise((res, rej) => {
    try {
      fileContents = readFileSync(shortcut.location, 'utf8');
      if (nameRegex.test(fileContents) && targetRegex.test(fileContents)) {
        res();
      } else {
        rej();
      }
    } catch (e) {
      rej();
    }
  });
}

function checkShortcutList() {
  const installDir = launcherUtils.getInstallDir();
  const shortcuts = [
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-start.desktop"),
        name: "Start Rise Vision Player",
        target: path.join(installDir, "scripts", "start.sh --unattended")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Start Rise Vision Player.lnk"),
        target: path.join(installDir, "scripts", "background.jse"),
        args: "start.bat --unattended"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-stop.desktop"),
        name: "Stop Rise Vision Player",
        target: path.join(installDir, "scripts", "stop.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Stop Rise Vision Player.lnk"),
        target: path.join(installDir, "scripts", "background.jse"),
        args: "stop.bat"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-uninstall.desktop"),
        name: "Uninstall Rise Vision Player",
        target: path.join(installDir, "scripts", "uninstall.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Uninstall Rise Vision Player.lnk"),
        target: path.join(installDir, "scripts", "uninstall.bat")
      }
    },
    {
      linux: {
        location: autostartPath,
        name: "Rise Vision Player",
        target: `bash -c '${path.join(installDir, "scripts", "start.sh --unattended")}'`
      },
      windows: {
        location: autostartPath,
        target: path.join(installDir, "scripts", "background.jse"),
        args: "start.bat --unattended"
      }
    }
  ];
  return Promise.all(shortcuts.map(checkShortcut));
}

function getScriptList() {
  return platform.isWindows() ?
    [
       "background.jse",
       "restart.bat",
       "start.bat",
       "stop.bat",
       "uninstall.bat"
    ] :
    [
       "restart.sh",
       "start.sh",
       "stop.sh",
       "uninstall.sh"
    ];
}

function checkScriptList() {
  const installDir = launcherUtils.getInstallDir();
  const scripts = getScriptList();
  const paths = scripts.map(script=>path.join(installDir, "scripts", script));

  return Promise.all(paths.map(checkScriptExists));
}

function checkScriptContents(version) {
  const moduleDir = launcherUtils.getInstallDir(version);
  const installDir = launcherUtils.getInstallDir();
  const scripts = getScriptList();
  const paths = scripts.map(script=>{
    return [
      path.join(installDir, "scripts", script),
      path.join(moduleDir, "Installer", "scripts", script)
    ];
  });

  return Promise.all(paths.map(pair=>{
    return readFileSync(pair[0], "utf8") === readFileSync(pair[1], "utf8") ?
      Promise.resolve() : Promise.reject();
  }));
}

module.exports = {
  getAutostartPath() {
    return autostartPath;
  },

  checkScriptsExist(ctx, version) {
    return new Promise((res) => {
      function curriedCheckScriptsExist() {
        log.debug("Checking scripts");
        checkScriptList()
        .then(()=>checkScriptContents(version))
          .then(res)
          .catch(() => {
            log.debug("Script check failed");
            ctx.timeouts.checkShortcutList = setTimeout(curriedCheckScriptsExist, 4000)
          });
      }

      curriedCheckScriptsExist();
    });
  },

  checkShortcutsNameAndTarget(ctx, version) {
    return new Promise((res) => {
      function curriedCheckShortcutsNameAndTarget() {
        log.debug("Checking shortcuts");
        checkShortcutList()
          .then(res)
          .catch(() => {
            log.debug("Shortcut check failed");
            ctx.timeouts.checkShortcutList = setTimeout(curriedCheckShortcutsNameAndTarget, 4000)
          });
      }

      curriedCheckShortcutsNameAndTarget();
    });
  }
};
