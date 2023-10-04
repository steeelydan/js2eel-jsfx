// Mostly taken from Pirkle: Designing Audio Effect Plug-Ins in C++ (2nd ed.)

config({
    description: 'sd_waveshapers',
    inChannels: 2,
    outChannels: 2
});

let gainIn;
let gainInDb;
let algorithm;
let dryOutput;
let dryOutputDb;
let wetOutput;
let wetOutputDb;
let volumeOut;
let volumeOutDb;

slider(1, gainInDb, 0, 0, 36, 0.01, 'Gain (dB)');
selectBox(
    2,
    algorithm,
    'sigmoid',
    [
        { name: 'arraya', label: 'Soft Clip: Arraya' },
        { name: 'sigmoid', label: 'Soft Clip: Sigmoid' },
        { name: 'sigmoid2', label: 'Soft Clip: Sigmoid 2' },
        { name: 'hyperbolic_tan', label: 'Soft Clip: Hyperbolic Tangent' },
        { name: 'arctan', label: 'Soft Clip: Arctangent' },
        { name: 'fuzz_exp', label: 'Soft Clip: Fuzz Exponential' },
        { name: 'exp_2', label: 'Exponential 2' },
        { name: 'arctan_square', label: 'Arctangent Square Root' },
        { name: 'square_sign', label: 'Square Sign' },
        { name: 'cube', label: 'Cube' },
        { name: 'hclip', label: 'Hard Clip' },
        { name: 'half_wave_rect', label: 'Half Wave Rectifier' },
        { name: 'full_wave_rect', label: 'Full Wave Rectifier' },
        { name: 'square_law', label: 'Square Law' },
        { name: 'abs_square_root', label: 'Absolute Square Root' }
    ],
    'Algorithm'
);
slider(3, dryOutputDb, -96, -96, 0, 0.1, 'Dry (dB)');
slider(4, wetOutputDb, 0, -96, 0, 0.1, 'Wet (dB)');
slider(5, volumeOutDb, 0, -18, 18, 0.01, 'Volume (dB)');

onSlider(() => {
    if (
        algorithm !== 'sigmoid' &&
        algorithm !== 'hyperbolic_tan' &&
        algorithm !== 'arctan' &&
        algorithm !== 'fuzz_exp' &&
        algorithm !== 'hclip'
    ) {
        // Set gain slider to 0 for the algorithms that do not use input gain
        gainInDb = 0;
        gainIn = 1;
    } else {
        gainIn = Math.pow(10, gainInDb / 20);
    }

    dryOutput = dryOutputDb < -95 ? 0 : 10 ** (dryOutputDb / 20);
    wetOutput = wetOutputDb < -95 ? 0 : 10 ** (wetOutputDb / 20);
    volumeOut = Math.pow(10, volumeOutDb / 20);
});

onSample(() => {
    eachChannel((sample, _channel) => {
        const dry = sample;
        
        if (algorithm === 'arraya') {
            sample = 3 * sample * 0.5 * (1 - sqr(sample) / 3);
        } else if (algorithm === 'sigmoid') {
            sample = 2 * (1 / (1 + exp(-gainIn * sample))) - 1;
        } else if (algorithm === 'sigmoid2') {
            sample =
                ((exp(sample) - 1) * ($e + 1)) / ((exp(sample) + 1) * ($e - 1));
        } else if (algorithm === 'hyperbolic_tan') {
            sample =
                (exp(2 * sample * gainIn) - 1) /
                (exp(2 * sample * gainIn) + 1) /
                ((exp(2 * gainIn) - 1) / (exp(2 * gainIn) + 1));
        } else if (algorithm === 'arctan') {
            sample = atan(sample * gainIn) / atan(gainIn);
        } else if (algorithm === 'fuzz_exp') {
            sample =
                (sign(sample) * (1 - exp(-abs(gainIn * sample)))) /
                (1 - exp(-gainIn));
        } else if (algorithm === 'exp_2') {
            sample = ($e - exp(1 - sample)) / ($e - 1);
        } else if (algorithm === 'arctan_square') {
            sample =
                2.5 * atan(0.9 * sample) +
                2.5 * sqrt(1 - sqr(0.9 * sample)) -
                2.5;
        } else if (algorithm === 'square_sign') {
            sample = sqr(sample) * sign(sample);
        } else if (algorithm === 'cube') {
            sample = sample ** 3;
        } else if (algorithm === 'hclip') {
            sample *= gainIn;
            sample = abs(sample) > 0.5 ? 0.5 * sign(sample) : sample;
        } else if (algorithm === 'half_wave_rect') {
            sample * 0.5 * (sample + abs(sample));
        } else if (algorithm === 'full_wave_rect') {
            sample * abs(sample);
        } else if (algorithm === 'square_law') {
            sample = sqr(sample);
        } else if (algorithm === 'abs_square_root') {
            sample = sqrt(abs(sample));
        }

        sample = (sample * wetOutput + dry * dryOutput) * volumeOut;
    });
});
