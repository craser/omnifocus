#!/bin/bash

default_project="Work"
default_context="Online"
default_due="7:00 PM"

command="$*"

bin=`dirname $0`

echo "command: $command"



context=`echo $command | egrep -io "#\w*"`
project=`echo $command | egrep -io "\.\w*"`
name=$command
due=`echo $command | egrep -io "\d:?(\d\d)? ?(a|p|am|pm)?"`

if [ -z "$context" ]; then
    context=$default_context
fi
if [ -z "$project" ]; then
    project=$default_project
fi
if [ -z "$due" ]; then
    due=$default_due
fi

echo "context: $context"
echo "project: $project"
echo "name   : $name"
echo "due    : $due"

osascript $bin/CreateTask.scpt "$context" "$project" "$name" "$due"
echo done
