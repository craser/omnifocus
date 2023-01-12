'use strict'

const Rule = require('./Rule');

/**
 * First cut at this feature. Hard-coding to play & decide what I want.
 * My day is currently blocked out like this:
 *     - 08:30am: morning meeting
 *     - 09:00am: breakfast, email, Slack
 *     - 09:30am: coffee, headphones, code
 *             OR
 *            errands
 *     - 11:00am: ride
 *     - 01:00pm: lunch, Slack
 *     - 02:00pm: coffee, headphones, code
 *     - 04:00pm: dad stuff
 *
 * Ideally, I'd like my daily to-do list to appear in chronological
 * order. So let's try this:
 *     - :errands ➤ due at 11am
 *     - .work ➤ due at 3pm
 *     - :housekeeping ➤ due at 9pm
 *     - :waiting ➤ due at 10pm
 *
 *
 * Going to hard-code this for now & refactor later in my copious free time.
 *
 * RULES:
 *     ✓ default project: work
 *     ✓ default parent task: general
 *     ✓ default due date: today (implemented in DateParser)
 *     ✓ default due time: 7pm (in DateParser)
 *     ✓ :errands ➤ due at 11am
 *     ✓ .housekeeping ➤ due at 11am
 *     ✓ .work ➤ due at 3pm
 *     ✓ :waiting ➤ due at 10pm
 *     ✓ :notdue ➤ remove due date, AND remove :notdue tag
 *     ✓ tasks with Jira tickets in name get that ticket injected into context spec
 *
 * TODO: (follow-up)
 *     - remove default date & time logic from DateParser
 *     - remove implementation of above rules from RuleManager

 * @return {{}}
 */

function applyRules(task) {
    this.rules.forEach((rule) => {
        task = rule.apply(task);
    });
    return task;
}

function parseRules(rulesConfig) {
    return rulesConfig.map(rule => new Rule(rule));
}

function RuleManager(config) {
    this.rules = parseRules(config.getRulesConfig());
    this.applyRules = applyRules;
}

module.exports = RuleManager;
