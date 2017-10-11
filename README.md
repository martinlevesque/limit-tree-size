# limit-tree-size

[![NPM](https://nodei.co/npm/limit-tree-size.png)](https://nodei.co/npm/limit-tree-size/)

[![Build status](https://travis-ci.org/martinlevesque/limit-tree-size.svg?branch=master)](https://travis-ci.org/martinlevesque/limit-tree-size)

limit-tre-size allows to limit directories sizes by polling a set of predefined
folder paths.

## LimitDirs Class Usage

### Install

```
npm install limit-tree-size --save
```

### With fixed folders

First we need to instantiate a LimitDirs:

```
const LimitTreeSize = require("limit-dirs");

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
