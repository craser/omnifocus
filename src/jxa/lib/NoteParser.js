#!/usr/bin/env node

/**
 * Assumes a 10-digit phone number (with optional +1 prefix) like those used in the US.
 * @param string - should be just the string recognized as a phone number
 * @return string - phone number formatted as (000) 000-0000
 */
function formatPhone(string) {
    var digits = string.replace(/[^\d]/g, '');
    var phone = digits.replace(/(...)(...)(....)/, "($1) $2-$3");
    return phone;
}

function parsePhoneNumbers(string) {
    var re = /((\s|^)(\+1)?[(]*(\d{3})[).\s]*(\d{3})[.\s\-]*(\d{4})(\s|$))/g;
    var phones = [];
    string.replace(re, function (p) {
        phones.push(formatPhone(p));
    });
    return phones;
}

function parseNote(string) {
    var note = string.replace(/^.*?(\/\*\*\s*|$)/, '');
    try {
        note += parsePhoneNumbers(string).map(p => `\np: ${p}`).join('');
    } catch (e) {
        note = string + '\n\n' + e.toString();
    }
    return note;
}

class NoteParser {
    parse(string) {
        return parseNote(string);
    }
}

module.exports = NoteParser;
