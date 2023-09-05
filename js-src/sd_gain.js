config({ description: 'sd_gain', inChannels: 2, outChannels: 2 });

let gainDb = 0;
let gain = 0;

slider(1, gainDb, 0, -18, 18, 0.1, 'Gain (dB)');

onSlider(() => {
    gain = 10 ** (gainDb / 20);
});

onSample(() => {
    eachChannel((sample, _channel) => {
        sample *= gain;
    });
});