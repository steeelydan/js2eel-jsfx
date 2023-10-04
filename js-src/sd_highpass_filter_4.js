config({ description: 'sd_highpass_filter_4', inChannels: 2, outChannels: 2 });

let hpFreq;
let hpQ;
let outputGainDb;
let outputGain;

const hpCoefs = {
    a1x: 0,
    a2x: 0,
    b0x: 0,
    b1x: 0,
    b2x: 0
};

const hpXStore = new EelArray(2, 3);
const hpYStore = new EelArray(2, 3);

slider(1, hpFreq, 20, 20, 22000, 1, 'HP Freq');
slider(2, hpQ, 0.5, 0.1, 7, 0.01, 'Q');
slider(50, outputGainDb, 0, -15, 15, 0.01, 'Output Gain (dB)');

function setHpCoefs() {
    const omega = 2 * $pi * hpFreq / srate;
    const sinOmega = sin(omega);
    const cosOmega = cos(omega);
    const alpha = sinOmega / (2 * hpQ);

    const a0 = 1 + alpha;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha;
    const b0 = (1 + cosOmega) / 2;
    const b1 = -(1 + cosOmega);
    const b2 = (1 + cosOmega) / 2;

    hpCoefs.a1x = a1 / a0;
    hpCoefs.a2x = a2 / a0;
    hpCoefs.b0x = b0 / a0;
    hpCoefs.b1x = b1 / a0;
    hpCoefs.b2x = b2 / a0;
}

function processBiquad(value, ch, coefs, xStore, yStore) {
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
    setHpCoefs();

    outputGain = 10 ** (outputGainDb / 20);
});

onSample(() => {
    eachChannel((sample, ch) => {
        if (hpFreq > 20) {
            sample = processBiquad(sample, ch, hpCoefs, hpXStore, hpYStore);
        }

        sample = sample * outputGain;
    });
});
