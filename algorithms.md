# Useful Audio DSP Algorithms

## Rules of Logarithm

```
log(x * y) = log(x) + log(y)
log(x / y) = log(x) - log(y)
log(x ^ y) = y * log(x)
log(1 / x) = -log(x)
log(1) = 0
NOT for log10: ln(e) = 1
```

## Decibels / amplitude conversion:

```eel
decibels = 20 * log(abs(amplitude));
amplitude = 10 ^ (decibels / 20);
```

## Filters

Tutorial: https://www.youtube.com/live/HexzW0EZal8?t=5523

Useful for frequency manipulation. Memorize one or more previous sample to decide what to do with the current sample.

Examples:

-   Make amplitude change _more intense_ / _faster_ / _steeper_ => Less low frequencies, high-pass.

-   Make amplitude change _less intense_ / _slower_ / _less steep_ => Less high frequencies, low-pass.

```eel
@sample
average = (spl0 + previous) / 2;    // Make amplitude change less steep by averaging it with previous sample
previous = spl0;                    // Save this sample for next round
spl0 = average;
```

### Feed-Forward and Feedback (Pirkle)

-   Feed-Forward:

    -   Make some frequencies go to zero: _zero_
    -   Step & impulse responses are smearing
    -   Do not blow up
    -   Are called _Finite Impulse Response_ filters (FIR)

-   Feedback:
    -   Make some frequencies go to infinity: _pole_
    -   Step and impulse responses overshoot & ring / smear depending on coefs
    -   Can blow up or go unstable
    -   Are called _Infinite Impulse Response_ filters (IIR)

### Biquad Filters

https://www.w3.org/TR/audio-eq-cookbook/

#### Intermediate Variables

```eel
A = 10 ^ (gain / 40);               // Only for peaking & shelving EQs
omega = 2 * $pi * freq / srate;
sinOmega = sin(omega);
cosOmega = cos(omega);
alpha = sinOmega / (2 * q);
```

#### Coefficients Per Filter Type

```eel
// High Pass

b0 = (1 + cosOmega) / 2;
b1 = - (1 + cosOmega);
b2 = (1 + cosOmega) / 2;
a0 = 1 + alpha;
a1 = -2 \* cosOmega;
a2 = 1 - alpha;

// Low Pass

b0 = (1 - cosOmega) / 2;
b1 = 1 - cosOmega;
b2 = (1 - cosOmega) / 2;
a0 = 1 + alpha;
a1 = -2 \* cosOmega;
a2 = 1 - alpha;

// Low Shelf

b0 = A * ((A + 1) - (A - 1) * cosOmega + 2 * sqrt(A) * alpha);
b1 = 2 * A * ((A - 1) - (A + 1) * cosOmega);
b2 = A * ((A + 1) - (A - 1) * cosOmega - 2 * sqrt(A) * alpha);
a0 = (A + 1) + (A - 1) * cosOmega + 2 * sqrt(A) * alpha;
a1 = -2 * ((A - 1) + (A + 1) * cosOmega);
a2 = (A + 1) + (A - 1) * cosOmega - 2 * sqrt(A) * alpha;

// High Shelf

b0 = A * ((A + 1) + (A - 1) * cosOmega + 2 * sqrt(A) * alpha);
b1 = -2 * A * ((A - 1) + (A + 1) * cosOmega);
b2 = A * ((A + 1) + (A - 1) * cosOmega - 2 * sqrt(A) * alpha);
a0 = (A + 1) - (A - 1) * cosOmega + 2 * sqrt(A) * alpha;
a1 = 2 * ((A - 1) - (A + 1) * cosOmega);
a2 = (A + 1) - (A - 1) * cosOmega - 2 * sqrt(A) * alpha;

// Peak EQ

b0 = 1 + alpha * A;
b1 = -2 * cosOmega;
b2 = 1 - alpha * A;
a0 = 1 + alpha / A;
a1 = -2 * cosOmega;
a2 = 1 - alpha / A;
```

#### The Difference Equation

```eel
@sample

x = spl0;
y = (b0 / a0) * x       // Feed-forward
    + (b1 / a0) * x1
    + (b2 / a0) * x2
    - (a1 / a0) * y1    // Feedback
    - (a2 / a0) * y2;

// Update state registers
y2 = y1;
y1 = y;
x2 = x1;
x1 = x;

spl0 = y;       // y: Our resulting value
```
