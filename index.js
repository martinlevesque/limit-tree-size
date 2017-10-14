const fs = require("fs");
const path = require("path");
const getFSize = require("get-folder-size");
const dirTree = require("directory-tree");

class LimitTreeSize {
  constructor(options = {}) {
    this.rootDir = options.rootDir || "./";
    this.forceDirs = options.forceDirs || [];
    this.level = options.level;
    this.intervalAutoScan = options.intervalAutoScan || 60;
    this.autoDiscoverNewSubDirs = options.autoDiscoverNewSubDirs || false;
    this.defaultLimitMB = options.defaultLimitMB || 1000000;
    this.activatedWatches = {};
    this.verbose = options.verbose || false;
  }

  // begin starting the watch methods to the limited directories
  async launch() {
    for (let d of this.forceDirs) {
      this._log("force to check dir " + d.dir + " with limit " + d.limitMB);
      this._activateWatch(d.dir, d.limitMB);
    }

    // scan on start!
    this._scanRoot().then(() => {
      this.objIntervalAutoScan = setInterval(() => {
        this._scanRoot().then(() => {

        }).catch((err) => {
          this._log(err);
        });
      }, this.intervalAutoScan * 1000);
    }).catch((err) => {
      this._log(err);
    });
  }

  stop() {
    if (this.objIntervalAutoScan) {
      clearInterval(this.objIntervalAutoScan);
    }
  }

  _log(msg) {
    if (this.verbose) {
      console.log((new Date()) + ": " + msg);
    }
  }

  _timeout(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  _getFoldersWithLevel(initDirs, level, curLevel, result = []) {
    let dirs = [];

    if (level == 0) {
      return [{
        "path": initDirs.path,
        "type": "directory"
      }];
    }
    else if (curLevel == 0) {
      dirs = initDirs.children;
      ++curLevel;
    } else {
      dirs = initDirs;
    }

    for (let f of dirs) {
      if (f.type == "directory") {
        if (level == curLevel) {
          result.push(f);
        }
        else if (curLevel < level) {
          result = this._getFoldersWithLevel(f.children, level, curLevel + 1, [...result]);
        }
      }
    }

    return result;
  }

  async _scanRoot() {
    try {
      if (this.autoDiscoverNewSubDirs) {
        let dirsWithLevel =
          this._getFoldersWithLevel(dirTree(this.rootDir), this.level, 0, []);

        for (let dir of dirsWithLevel) {
          if ( ! this.activatedWatches[dir.path]) {
            this._activateWatch(dir.path, this.defaultLimitMB);
          }
        }
      }

      let intBetweenDirCheck = (this.intervalAutoScan / 2.0)
        / (Object.keys(this.activatedWatches).length * 1.0)

      for (let dir of Object.keys(this.activatedWatches)) {
        if ( ! fs.existsSync(dir)) {
          this._log("Deactivated dir " + dir);
          delete this.activatedWatches[dir];
        } else {
          let sizeMB = (await this._folderSize(dir)).size / 1000 / 1000;
          await this._checkAndCleanInitFolder(dir, sizeMB, this.activatedWatches[dir]);
          await this._timeout(intBetweenDirCheck);
        }
      }

    } catch(err) {
      console.log(err);
      this._log(err);
    }
  }

  _activateWatch(dir, limitMB) {
    this.activatedWatches[dir] = limitMB;
    this._log("Activated dir " + dir + " to " + limitMB + " MB");
  }

  _deleteFile(f) {
    return new Promise((resolve, reject) => {
      fs.unlink(f, (err) => {
        if ( ! err) {
          this._log("deleted " + f);
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  _folderSize(f) {
    return new Promise((resolve, reject) => {
      getFSize(f, (err, size) => {
        if ( ! err) {
          resolve({
            "size": size,
            "type": "folder"
          });
        } else {
          reject(err);
        }
      });
    });
  }

  _getFirstFileFromRoot(root, contentDir = null) {
    if ( ! contentDir) {
      contentDir = dirTree(root).children;
    }

    for (let f of contentDir) {
      if (f.type != "directory") {
        return f;
      } else {
        let oneInChildren = this._getFirstFileFromRoot(f.path, f.children);

        if (oneInChildren) {
          return oneInChildren;
        }
      }
    }

    return null;
  }

  async _checkAndCleanInitFolder(root, sizeMB, limitMB) {
    try {
      while (sizeMB > limitMB) {
        let file = this._getFirstFileFromRoot(root);

        if ( ! file) {
          break;
        }

        await this._deleteFile(file.path);

        sizeMB = (await this._folderSize(root)).size / 1000 / 1000;
      }
    } catch(err) {
      this._log("issue cleaning " + root + ": " + err);
    }
  }
}

module.exports = LimitTreeSize
