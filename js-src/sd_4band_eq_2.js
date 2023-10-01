config({ description: 'sd_4band_eq_2', inChannels: 2, outChannels: 2 });

let lpFreq;
let lpQ;

let highType;
let highFreq;
let highQ;
let highGain;

let outputGainDb;
let outputGain;

const lpCoefs = {
    a1x: 0,
    a2x: 0,
    b0x: 0,
    b1x: 0,
    b2x: 0
};
const hiCoefs = {
    a1x: 0,
    a2x: 0,
    b0x: 0,
    b1x: 0,
    b2x: 0
};

const lpXStore = new EelArray(2, 3);
const lpYStore = new EelArray(2, 3);
const hiXStore = new EelArray(2, 3);
const hiYStore = new EelArray(2, 3);

slider(1, lpFreq, 22000, 5, 22000, 1, 'LP Freq');
slider(2, lpQ, 0.5, 0.1, 7, 0.01, 'Q');

selectBox(
    4,
    highType,
    'shelf',
    [
        { name: 'shelf', label: 'Shelf' },
        { name: 'peak', label: 'Peak' }
    ],
    'High Type'
);
slider(5, highFreq, 8000, 20, 20000, 1, 'Freq');
slider(6, highQ, 0.5, 0.1, 7, 0.01, 'Q');
slider(7, highGain, 0, -15, 15, 0.01, 'Gain (dB)');

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

    lpCoefs.a1x = a1 / a0;
    lpCoefs.a2x = a2 / a0;
    lpCoefs.b0x = b0 / a0;
    lpCoefs.b1x = b1 / a0;
    lpCoefs.b2x = b2 / a0;
}

function setPeakCoefs(targetCoefs, freq, gain, q) {
    const A = 10 ** (gain / 40);
    const omega = (2 * $pi * freq) / srate;
    const sinOmega = sin(omega);
    const cosOmega = cos(omega);
    const alpha = sinOmega / (2 * q);

    const a0 = 1 + alpha / A;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha / A;
    const b0 = 1 + alpha * A;
    const b1 = -2 * cosOmega;
    const b2 = 1 - alpha * A;

    targetCoefs.a1x = a1 / a0;
    targetCoefs.a2x = a2 / a0;
    targetCoefs.b0x = b0 / a0;
    targetCoefs.b1x = b1 / a0;
    targetCoefs.b2x = b2 / a0;
}

function processSample(value, ch, coefs, xStore, yStore) {
    yStore[ch][0] =
        coefs.b0x * xStore[ch][0] +
        coefs.b1x * xStore[ch][1] +
        coefs.b2x * xStore[ch][2] -
        coefs.a1x * yStore[ch][1] -
        coefs.a2x * yStore[ch][2];

    yStore[ch][2] = yStore[ch][1];
    yStore[ch][1] = yStore[ch][0];
    xStore[ch][2] = xStore[ch][1];
    xStore[ch][1] = xStore[ch][0];
    xStore[ch][0] = value;

    return yStore[ch][0];
}

onSlider(() => {
    setLpCoefs();
    setPeakCoefs(hiCoefs, highFreq, highGain, highQ);

    outputGain = 10 ** (outputGainDb / 20);
});

onSample(() => {
    eachChannel((sample, ch) => {
        if (lpFreq < 22000) {
            sample = processSample(sample, ch, lpCoefs, lpXStore, lpYStore);
        }

        if (highGain !== 0) {
            if (highType === 'peak') {
                sample = processSample(sample, ch, hiCoefs, hiXStore, hiYStore);
            } else {
            }
        }

        sample = sample * outputGain;
    });
});
