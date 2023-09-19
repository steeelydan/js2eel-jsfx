config({ description: 'sd_4band_eq_2', inChannels: 2, outChannels: 2 });

let lpFreq;
let lpQ;

const lpCoefs = new EelArray(2, 3);
const lpXCoefs = new EelArray(2, 3);
const lpXBuffer = new EelArray(2, 3);
const lpYBuffer = new EelArray(2, 3);

let outputGainDb;
let outputGain;

slider(1, lpFreq, 22000, 3000, 22000, 1, 'LP Freq');
slider(2, lpQ, 0.5, 0.1, 7, 0.01, 'Q');

slider(50, outputGainDb, 0, -15, 15, 0.01, 'Output Gain (dB)');

function setLpCoefs() {
    const omega = (2 * $pi * lpFreq) / srate;
    const sinOmega = sin(omega);
    const cosOmega = cos(omega);
    const alpha = sinOmega / (2 * lpQ);

    lpCoefs[0][0] = 1 + alpha;
    lpCoefs[0][1] = -2 * cosOmega;
    lpCoefs[0][2] = 1 - alpha;
    lpCoefs[1][0] = (1 - cosOmega) / 2;
    lpCoefs[1][1] = 1 - cosOmega;
    lpCoefs[1][2] = (1 - cosOmega) / 2;

    lpXCoefs[0][1] = lpCoefs[0][1] / lpCoefs[0][0];
    lpXCoefs[0][2] = lpCoefs[0][2] / lpCoefs[0][0];
    lpXCoefs[1][0] = lpCoefs[1][0] / lpCoefs[0][0];
    lpXCoefs[1][1] = lpCoefs[1][1] / lpCoefs[0][0];
    lpXCoefs[1][2] = lpCoefs[1][2] / lpCoefs[0][0];
}

function setCoefs() {
    setLpCoefs();
}

onInit(() => {
    setCoefs();
});

onSlider(() => {
    setCoefs();

    outputGain = 10 ** (outputGainDb / 20);
});

onSample(() => {
    eachChannel((sample, channel) => {
        function processSample(value) {
            lpYBuffer[channel][0] =
                lpXCoefs[1][0] * lpXBuffer[channel][0] +
                lpXCoefs[1][1] * lpXBuffer[channel][1] +
                lpXCoefs[1][2] * lpXBuffer[channel][2] -
                lpXCoefs[0][1] * lpYBuffer[channel][1] -
                lpXCoefs[0][2] * lpYBuffer[channel][2];

            lpYBuffer[channel][2] = lpYBuffer[channel][1];
            lpYBuffer[channel][1] = lpYBuffer[channel][0];
            lpXBuffer[channel][2] = lpXBuffer[channel][1];
            lpXBuffer[channel][1] = lpXBuffer[channel][0];
            lpXBuffer[channel][0] = value;

            return lpYBuffer[channel][0];
        }

        let value = sample;

        if (lpFreq < 22000) {
            value = processSample(value);
        }

        sample = value * outputGain;
    });
});
