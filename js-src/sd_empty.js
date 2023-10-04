/*
v1.0.0
Does nothing. Only exists to measure JSFX environment overhead.
*/

config({ description: 'sd_empty', inChannels: 2, outChannels: 2 });

let someVar;

slider(1, someVar, 0, 0, 1, 0.1, 'Useless slider');

onSample(() => {
    eachChannel((sample, _ch) => {
        sample = sample;
    });
});
