function consumeUnquotedSegment(meta, i, spec) {
    let segment = '';
    for (; i < meta.length; i++) {
        if (meta[i] === ' ') { // end of spec
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else if (meta[i] === '.') { // end of segment
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else {
            segment += meta[i];
        }
    }
    
    if (segment) {
        spec.push(segment);
    }
    return i;
}

// This one does double-duty parsing both quoted segments and segments within quoted specs, hence the check for .
function consumeQuotedSegment(meta, i, spec, quote) {
    let segment = '';
    for (; i < meta.length; i++) {
        if (meta[i] === '.') { // end of segment
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else if (meta[i] === quote) { // end of segment
            spec.push(segment);
            segment = '';
            // leave i alone
            break;
        } else {
            segment += meta[i];
        }
    }
    
    if (segment) {
        spec.push(segment);
    }
    return i;
}


function consumeSpec(meta, i, spec) {
    for (; i < meta.length; i++) {
        if (meta[i] === ' ') { // end of spec
            break;
        } else if (meta[i] === '.') { // beginning of spec/segment
            continue;
        } else if (meta[i] === "'" || meta[i] === '"') {
            i = consumeQuotedSegment(meta, i + 1, spec, meta[i]);
        } else {
            i = consumeUnquotedSegment(meta, i, spec);
        }
    }
    return spec;
}

function consumeQuotedSpec(meta, i, spec, quote) {
    for (; i < meta.length; i++) {
        if (meta[i] === quote) { // end of spec
            break;
        } else if (meta[i] === '.') {
            continue;
        } else {
            i = consumeQuotedSegment(meta, i, spec, quote);
        }
    }
    return spec;
}


function consumeMeta(meta) {
    var spec = [];
    for (var i = 0; i < meta.length; i++) {
        if (meta[i] === '.') {
            consumeSpec(meta, i, spec);
            break;
        } else if ((meta[i] === "'" || meta[i] === '"') && meta[i + 1] === '.') { // beginning of spec
            consumeQuotedSpec(meta, i+1, spec, meta[i]);
            break;
        } else if ((meta[i] === "'" || meta[i] === '"')) { // beginning of some other quoted thing
            var quote = meta[i++];
            while (meta[i++] != quote);
        }
    }
    return spec;
}

class ContextParser {
    parse(meta) {
        return consumeMeta(meta);
    }
}

module.exports = ContextParser;
