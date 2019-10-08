#!/bin/bash

default_project="Work"
default_context="Online"
default_due="7:00 PM"

command="$*"

bin=`dirname $0`

echo "command: $command"

function sr {
    echo $2 | perl -0777 -pe "$1"
}

function normalize_time {
    sr 's/^(\d)(\s|\w)/$1:00$2/' "$1"
}

function strip_time {
    sr 's/\d{1,2}(:\d\d)?\s?(am|pm)//i' "$1"
}

function strip_project {
    sr 's/\.\w+//' "$1"
}

function strip_context {
    sr 's/\#\w+//' "$1"
}

context=`echo $command | egrep -io "#\w*" | sed 's/#//'`
project=`echo $command | egrep -io "\.\w*" | sed 's/\.//'`
due=`echo $command | egrep -io "\d\d?:?(\d\d)? ?(am|pm)?"`
due=`normalize_time $due`


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
echo "due    : $due"

name=`strip_time "$command"`
name=`strip_project "$name"`
name=`strip_context "$name"`
name=`echo $name`

echo "name   : $name"

osascript $bin/CreateTask.scpt "$context" "$project" "$name" "$due"

