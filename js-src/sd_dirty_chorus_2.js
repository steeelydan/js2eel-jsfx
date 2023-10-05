config({ description: 'sd_dirty_chorus_2', inChannels: 2, outChannels: 2 });

let depth;
let freq;
let movement;
let position;

let numSamples = {
    L: 2000,
    R: 2000
};
const modValue = {
    L: 0,
    R: 0
};
const readIndex = {
    L: 0,
    R: 0
};
let writeIndex;

const bufferSize = 6000;
const buffer = new EelBuffer(2, bufferSize);

slider(1, depth, 1, 0, 5, 0.01, 'Depth');
slider(2, freq, 0.2, 0.1, 6, 0.01, 'Freq (Hz)');

onSlider(() => {
    movement = (2 * $pi * freq) / srate;
});

onSample(() => {
    modValue.L = (sin(position) * depth) / 100;
    numSamples.L += modValue.L;
    readIndex.L = writeIndex - floor(numSamples.L);
    if (readIndex.L < 0) {
        readIndex.L += bufferSize;
    }

    modValue.R = (cos(position) * depth) / 100;
    numSamples.R += modValue.R;
    readIndex.R = writeIndex - floor(numSamples.R);
    if (readIndex.R < 0) {
        readIndex.R += bufferSize;
    }

    const bufferValueL = buffer[0][readIndex.L];
    const bufferValueR = buffer[1][readIndex.R];

    writeIndex += 1;
    if (writeIndex >= bufferSize) {
        writeIndex = 0;
    }

    buffer[0][writeIndex] = spl0;
    buffer[1][writeIndex] = spl1;

    spl0 = spl0 + bufferValueL;
    spl1 = spl1 + bufferValueR;

    position = position + movement;

    if (position >= 2 * $pi) {
        position -= 2 * $pi;
    }
});
