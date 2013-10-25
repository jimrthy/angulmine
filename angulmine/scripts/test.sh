#!/bin/bash

BASE_DIR=`dirname $0`
CHROME_BIN='/usr/bin/google-chrome-beta'

echo ""
echo "Starting Karma Server (http://karma-runner.github.io)"
echo "-------------------------------------------------------------------"

karma start $BASE_DIR/../config/karma.conf.js $*
