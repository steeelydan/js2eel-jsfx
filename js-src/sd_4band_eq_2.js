config({ description: 'sd_4band_eq_2', inChannels: 2, outChannels: 2 });

let lpFreq;
let lpQ;

const lpCoefs = new EelArray(2, 3);
const lpXStore = new EelArray(2, 3);
const lpYStore = new EelArray(2, 3);

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

    const a0 = 1 + alpha;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha;
    const b0 = (1 - cosOmega) / 2;
    const b1 = 1 - cosOmega;
    const b2 = (1 - cosOmega) / 2;

    lpCoefs[0][1] = a1 / a0;
    lpCoefs[0][2] = a2 / a0;
    lpCoefs[1][0] = b0 / a0;
    lpCoefs[1][1] = b1 / a0;
    lpCoefs[1][2] = b2 / a0;
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
            lpYStore[channel][0] =
                lpCoefs[1][0] * lpXStore[channel][0] +
                lpCoefs[1][1] * lpXStore[channel][1] +
                lpCoefs[1][2] * lpXStore[channel][2] -
                lpCoefs[0][1] * lpYStore[channel][1] -
                lpCoefs[0][2] * lpYStore[channel][2];

            lpYStore[channel][2] = lpYStore[channel][1];
            lpYStore[channel][1] = lpYStore[channel][0];
            lpXStore[channel][2] = lpXStore[channel][1];
            lpXStore[channel][1] = lpXStore[channel][0];
            lpXStore[channel][0] = value;

            return lpYStore[channel][0];
        }

        let value = sample;

        if (lpFreq < 22000) {
            value = processSample(value);
        }

        sample = value * outputGain;
    });
});
