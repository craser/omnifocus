# Quick Task Creation using Alfred & OmniFocus

## This provides a way to quickly create OmniFocus tasks using either the command line or Alfred.

* [Alfred](https://www.alfredapp.com/)
* [OmniFocus](https://www.omnigroup.com/omnifocus/)


## Command Line Usage

> create-omnifocus-task "[task information]"

Pass **one string** to the script for parsing. (Task info syntax below.)

## Alfred Usage

Alfred will listen for a hotkey (I use *Option-SPACE*, by YMMV), and present a text input box. Enter 
your task info (task info syntax below) in the box and hit **RETURN** to create the new OmniFocus task.

## Task Information Syntax

### General Syntax

> [task description] // .[project[.subtask]] :[tag] [due date] [time] [done] [flag]

* Everything before the *//* is the task description.
* The project, tag, and due date can be in any order.
* Project: a dot (.) followed by the project name.
  * Supports **subtasks**, by appending task name(s) after dot.
  * If not specified, defaults to **.work.general** (The **Work** project, under the **General** subtask.)
  * **Can** be just the first few letters of the project name
  * **Not** case-sensitive
* Tag: a colon (:) followed by the project name.
  * **Can** be just the first few letters of the tag name
  * **Not** case-sensitive
* Due Date can be **one** of the following: 
  * **tomorrow**
  * a day of the week (can be abbreviated): **Monday**, or **mon**
  * a date with optional year: 7/22 or 7/22/2021
  * a number of days, specified as Nday or Ndays (ex: 5days)
  * if not specified, defaults to **today**
* Time can be **one** of the following (note that **am** or **pm** is **required**):
  * Hpm (ex: 4pm)
  * H:MMam (ex: 7:22am)
  * if not specified, defaults to *7:00 PM*
* Done:
  * Is either absent, or the string "done"
  * If present, the new task is marked as **completed**, with a **completion date** of **now**.
* Flag
  * Is either absent, or the string "done"
  * If present, the new task is marked as **flagged**

### Examples

By default, all tasks are created in the **Work** project, with a Due Date of **Today at 7:00 PM** This works for me, and 
you're more than welcome to update your copy of this code to remove/alter those defaults.

> Book dermatology appointment

Creates a new task "Book dermatology appointment" in the project **Work**, nested under the **General** subtask, due **today at 7:00 PM**

> Make the logo bigger // .THX-1138 

Creates a new task "Make the logo bigger" in the project **Work**, nested under the **THX-1138** subtask, due **today at 7:00 PM**

> Book dermatology appointment // .health

Creates a new task "Book dermatology appointment" in the project **Health**, due **today at 7:00 PM**

> Book dermatology appointment // .health :phone

Creates a new task "Book dermatology appointment" in the project **Health**, with the tag **Phone**, due **today at 7:00 PM**

> Book dermatology appointment // .health :phone 2pm

Creates a new task "Book dermatology appointment" in the project **Health**, with the tag **Phone**, due **today at 2:00 PM**

> Book dermatology appointment // .health 10:30am

Creates a new task "Book dermatology appointment" in the project **Health**, due **today at 10:30 AM**

> Ping Horatio re. New Spec // .work 10am flag

Creates a new task "Ping Horation re. New Spec"" in the project **Work**, due at 10:00 AM today, marked as **flagged**.






