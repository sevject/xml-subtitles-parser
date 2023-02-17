let srtCounter = 0, vttCounter = 0;
const
    fs = require('fs'),
    path = require('path'),
    fileName = 'subtitle english.xml',
    scriptPath = path.resolve(__dirname, fileName),
    file = fs.readFileSync(scriptPath, 'utf8'),
    {XMLParser} = require('fast-xml-parser'),
    parser = new XMLParser({ignoreAttributes: false}),
    jsonObj = parser.parse(file),
    lines = jsonObj['tt:tt']['tt:body']['tt:div']['tt:p'],
    srt = lines.map(l => {
        const
            start = l['@_begin'].replace('.', ','),
            end = l['@_end'].replace('.', ','),
            span = l['tt:span'],
            text = Array.isArray(span) ? span.map(t => t['#text']).join('\n') : span['#text'];

        srtCounter = srtCounter+1;

        return `${srtCounter}\n${start} --> ${end}\n${text}`;
    }).join('\n\n'),
    vtt = lines.map(l => {
        const
            style = l['@_style'],
            styleMap = {textLeft: ' align:start', textRight: ' align:end'},
            voiceMap = {S4: 'textYellow', S5: 'textCyan'},
            span = l['tt:span'];
        let text, line;

        if (Array.isArray(span)) {
            line = ' line:-2';
            text = span.map(t =>
                voiceMap[t['@_style']]
                    ? `<c.${voiceMap[t['@_style']]}>${t['#text']}</c>`
                    : t['#text']
            ).join('\n');
        } else {
            line = ' line:-1';
            text = voiceMap[span['@_style']]
                ? `<c.${voiceMap[span['@_style']]}>${span['#text']}</c>`
                : span['#text'];
        }

        vttCounter = vttCounter+1;

        return `${vttCounter}\n${l['@_begin']} --> ${l['@_end']}${styleMap[style] ? line + styleMap[style] : ''}\n${text}`;
    }).join('\n\n'),
    vttStyling = `WEBVTT\n\nSTYLE
::cue {
  background-color: #000000c2;
}
::cue(.textYellow) {
  color: yellow;
}
::cue(.textCyan) {
  color: cyan;
}\n\n`;

fs.writeFileSync(path.resolve(__dirname, 'subs.srt'), srt);
fs.writeFileSync(path.resolve(__dirname, 'subs.vtt'), vttStyling + vtt);
