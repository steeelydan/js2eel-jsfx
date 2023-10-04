config({description: "sd_impulse", inChannels: 2, outChannels: 2});

let done = new EelArray(2, 1);

onSample(() => {
    eachChannel((sample, ch) => {
        if (!done[0][ch]) {
            sample = 1;
            done[0][ch] = true;
        } else {
            sample = 0;
        }
    });
});