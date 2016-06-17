const fs = require("fs");
const path = require("path");
const ws = require("windows-shortcuts");
const platform = require("rise-common-electron").platform;
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
    fs.statSync(script);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject();
  }
}

function escapeStringRegex(s) {
  return s.replace(/\./g, '\\.');
}

function getInstallDir(version) {
  return platform.isWindows() ?
    path.join(process.env["LOCALAPPDATA"], "rvplayer", version) :
    path.join(process.env["HOME"], "rvplayer", version);
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
      fileContents = fs.readFileSync(shortcut.location, 'utf8');
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

function checkShortcutList(version) {
  const installDir = getInstallDir(version);
  const shortcuts = [
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-start.desktop"),
        name: "Start Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "start.sh --unattended")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Start Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "start.bat --unattended"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-stop.desktop"),
        name: "Stop Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "stop.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Stop Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "stop.bat"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-uninstall.desktop"),
        name: "Uninstall Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "uninstall.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Uninstall Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "uninstall.bat")
      }
    },
    {
      linux: {
        location: autostartPath,
        name: "Rise Vision Player",
        target: `bash -c '${path.join(installDir, "Installer", "scripts", "start.sh --unattended")}'`
      },
      windows: {
        location: autostartPath,
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "start.bat --unattended"
      }
    }
  ];
  return Promise.all(shortcuts.map(checkShortcut));
}

function checkScriptList(version) {
  const installDir = getInstallDir(version);

  const scriptPaths = platform.isWindows() ?
    [
      path.join(installDir, "Installer", "scripts", "background.jse"),
      path.join(installDir, "Installer", "scripts", "restart.bat"),
      path.join(installDir, "Installer", "scripts", "start.bat"),
      path.join(installDir, "Installer", "scripts", "stop.bat"),
      path.join(installDir, "Installer", "scripts", "uninstall.bat")
    ] : // End of Windows Script Paths
    [
      path.join(installDir, "Installer", "scripts", "restart.sh"),
      path.join(installDir, "Installer", "scripts", "start.sh"),
      path.join(installDir, "Installer", "scripts", "stop.sh"),
      path.join(installDir, "Installer", "scripts", "uninstall.sh")
    ];

    return Promise.all(scriptPaths.map(checkScriptExists));
}

module.exports = {
  getAutostartPath() {
    return autostartPath;
  },

  checkScriptsExist(ctx, version) {
    return new Promise((res) => {
      function curriedCheckScriptsExist() {
        log.debug("Checking scripts");
        checkScriptList(version)
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
        checkShortcutList(version)
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
