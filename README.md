# limit-tree-size

[![NPM](https://nodei.co/npm/limit-tree-size.png)](https://nodei.co/npm/limit-tree-size/)

limit-tree-size allows to limit directories sizes by polling a set of predefined
folder paths. When the size of a checked folder is higher than its limit, files
are deleted in order to keep the size below/equal its limit.

## LimitTreeSize Class Usage

### Install

```
npm install limit-tree-size --save
```

### With fixed folders

First we need to instantiate a LimitDirs:

```
const LimitTreeSize = require("limit-tree-size");

const dirLimiter = new LimitTreeSize(
  {
    "forceDirs": [{
      "dir": "./test/repos-test/basic/",
      "limitMB": 5 // 5 MB
    }],
    "autoDiscoverNewSubDirs": false,
    "verbose": false
  });
```

and then launch it:

```
dirLimiter.launch();
```

This will watch the directory ./test/repos-test/basic/ and make sure its size
is less than 5 MB. Whenever a file is created or changed, if the new folder size
is larger than 5 MB, the file will be deleted.

### Automatic Subdir discovery

First let's instantiate a LimitTreeSize:

```
const dirLimiter = new LimitTreeSize(
  {
    "rootDir": "./test/repos-test/websites/",
    "level": 2,
    "autoDiscoverNewSubDirs": true,
    "intervalAutoScan": 3, // in seconds
    "defaultLimitMB": 5,
    "verbose": false
  });

dirLimiter.launch();
```

This will check every 3 seconds for new sub directories with level 2 and limit
these directories to 5 MB. So let's say we now have the following tree:

```
-- ./test/repos-test/websites/
---- ./test/repos-test/websites/user1
------ ./test/repos-test/websites/user1/website1
------ ./test/repos-test/websites/user1/website2
```

Both website1 and website2 will be limited to 5 MB each. The level represents
the number of children steps. With level 1, it would look for the direct
subdirectories.

## Callback Events

Some callbacks can be defined for different event types:

* callbackBeginDeletion: When the deletion of files process begins.
* callbackEndDeletion: When the deletion of files process ends.
* callbackOnDelete(filename): When a file (filename) is deleted.
* callbackOnCheckSizes: When the process to check the sizes begins.

Example usage:

```
const dirLimiter = new LimitTreeSize(
  {
    "rootDir": "./test/repos-test/websites/",
    "level": 2,
    "autoDiscoverNewSubDirs": true,
    "intervalAutoScan": 3, // in seconds
    "defaultLimitMB": 5,
    "verbose": false,
    "callbackBeginDeletion": function() { console.log("begin deletion"); },
    "callbackEndDeletion": function() { console.log("end deletion"); },
    "callbackOnDelete": function(filename) { console.log(filename + " deleted"); },
    "callbackOnCheckSizes":
      function(dir, currentSize, limitSize) {
        console.log("checking sizes for ... " + dir); 
      }
  });

dirLimiter.launch();
```

## Command Line Interface

```
npm install -g limit-tree-size
```

The command line usage is the following:

```
limit-tree-size launch --rootDir <rootDir> --level <level> --intervalAutoScan <intervalAutoScan> --defaultLimitMB <defaultLimitMB> --verbose <verbose>
```

## License

ISC
