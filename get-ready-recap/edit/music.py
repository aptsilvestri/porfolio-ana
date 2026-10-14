"""Original energetic pop instrumental for the Get Ready recap.

Everything is synthesised here from oscillators and noise, so the track is
original and free of third-party rights. It is written on the edit's beat grid:
  bar 0      impact + full groove under the hook
  bars 0-14  groove A (kick, clap, hats, offbeat bass, pumping chords)
  bars 14-16 build: riser, snare roll, one beat of silence
  bar 16     drop into groove B (adds pluck arpeggio) for the live sessions
  bars 27-30 chorus for the end card (lead hook, open hats)
  bar 30     final chord hit, rings out to the end

usage: python3 music.py <bpm> <total_seconds> <out.wav> [stems_dir]
"""
import sys, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def adsr(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    na, nr = min(na, n), min(nr, n)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1, f2], 'band', fs=SR, output='sos'), x)


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((freq * t + phase) % 1.0) - 1


def place(buf, sig, t):
    i = int(round(t * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i]


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16)
    click = hp(rng.standard_normal(n), 2000) * env_exp(n, 0.004) * 0.3
    return np.tanh(1.6 * (body + click)) * 0.9


def clap():
    n = int(0.35 * SR)
    noise = bp(rng.standard_normal(n), 900, 3500)
    e = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR)
        e[i:] += env_exp(n - i, 0.008 if k < 2 else 0.12)
    return noise * e * 0.5


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp(rng.standard_normal(n), 7500, 4) * env_exp(n, 0.07 if open_ else 0.012) * (0.22 if open_ else 0.18)


def snare():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * env_exp(n, 0.04)
    nz = bp(rng.standard_normal(n), 1500, 7000) * env_exp(n, 0.06)
    return (0.5 * tone + 0.6 * nz) * 0.6


def supersaw(midi_notes, dur, cutoff=3200):
    n = int(dur * SR)
    out = np.zeros(n)
    for m in midi_notes:
        for d in (-0.12, -0.05, 0, 0.05, 0.12):
            out += saw(mtof(m + d), n, rng.random())
    out = lp(out, cutoff) / (len(midi_notes) * 5)
    return out * adsr(n, 0.01, 0.08)


def pluck(m, dur=0.22, bright=4000):
    n = int(dur * SR)
    x = saw(mtof(m), n) + 0.5 * saw(mtof(m + 12), n)
    x = lp(x, bright) * env_exp(n, 0.08)
    return x * adsr(n, 0.002, 0.03) * 0.35


def bass_note(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = 0.6 * saw(mtof(m), n) + 0.7 * np.sin(2 * np.pi * mtof(m) * t)
    x = lp(x, 700)
    return np.tanh(1.5 * x) * adsr(n, 0.004, 0.04) * env_exp(n, 0.35) * 0.55


def reverb(x, secs=1.6, mix=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * env_exp(n, secs / 5)
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[:len(x)]
    return x + mix * wet


def main():
    bpm = float(sys.argv[1]); total = float(sys.argv[2]); out = sys.argv[3]
    stems_dir = sys.argv[4] if len(sys.argv) > 4 else None
    b = 60.0 / bpm; bar = 4 * b
    N = int(total * SR) + SR
    drums, bass, chords, lead, fx = (np.zeros(N) for _ in range(5))

    # I-V-vi-IV in C major: C G Am F (one chord per bar)
    prog = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69])]
    K, C, S = kick(), clap(), snare()

    def groove(bar_i, hats_open=False, claps=True):
        t0 = bar_i * bar
        for q in range(4):
            place(drums, K, t0 + q * b)
            if claps and q in (1, 3):
                place(drums, C, t0 + q * b)
            place(drums, hat(open_=hats_open), t0 + q * b + b / 2)
            place(drums, hat() * 0.6, t0 + q * b + b / 4 * 3)

    def harmony(bar_i, stabs=False, level=1.0):
        root, notes = prog[bar_i % 4]
        t0 = bar_i * bar
        for q in range(4):  # offbeat pop-house bass
            place(bass, bass_note(root, b * 0.45), t0 + q * b + b / 2)
            place(bass, bass_note(root, b * 0.3) * 0.6, t0 + q * b)
        if stabs:
            for q in range(8):
                place(chords, supersaw(notes, b * 0.4) * 0.8 * level, t0 + q * b / 2)
        else:
            place(chords, supersaw(notes, bar * 0.98) * level, t0)

    def arp(bar_i, level=1.0):
        _, notes = prog[bar_i % 4]
        seq = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12]
        for s in range(16):
            place(lead, pluck(seq[s % 8]) * level, bar_i * bar + s * b / 4)

    hook_melody = [(0, 76, 1), (1, 79, 1), (2, 81, 0.5), (2.5, 79, 0.5), (3, 76, 1)]

    def lead_hook(bar_i):
        _, notes = prog[bar_i % 4]
        shift = {0: 0, 1: -1, 2: 0, 3: -3}[bar_i % 4]
        for (pos, m, d) in hook_melody:
            place(lead, pluck(m + shift, dur=d * b, bright=5000) * 1.2, bar_i * bar + pos * b)

    # impact on the first frame
    imp = np.zeros(int(2.5 * SR))
    imp[:len(K)] += K * 1.2
    imp += hp(rng.standard_normal(len(imp)), 3000) * env_exp(len(imp), 0.5) * 0.12
    place(fx, imp, 0)

    for i in range(0, 14):
        groove(i, claps=True)
        harmony(i, stabs=(i == 0))
    # build bars 14-16
    for i in (14, 15):
        harmony(i, level=0.8)
        for q in range(4):
            place(drums, K * 0.9, i * bar + q * b)
    roll = [15 * bar + k * b / 4 for k in range(12)]
    for k, t in enumerate(roll):
        place(drums, S * (0.3 + 0.7 * k / len(roll)), t)
    rn = int(2 * bar * SR - b * SR)
    riser = hp(rng.standard_normal(rn), 800) * np.linspace(0, 1, rn) ** 2 * 0.25
    place(fx, riser, 14 * bar)
    # silence the last beat before the drop
    cut0, cut1 = int((16 * bar - b) * SR), int(16 * bar * SR)
    for buf in (drums, bass, chords, lead):
        buf[cut0:cut1] *= np.linspace(1, 0, cut1 - cut0) ** 4
    place(fx, imp, 16 * bar)
    for i in range(16, 27):
        groove(i)
        harmony(i)
        arp(i, level=0.8)
    place(fx, imp, 27 * bar)
    for i in range(27, 30):
        groove(i, hats_open=True)
        harmony(i, stabs=True, level=1.1)
        lead_hook(i)
        arp(i, level=0.5)
    # final hit
    tf = 30 * bar
    place(fx, imp * 1.1, tf)
    place(chords, supersaw(prog[0][1] + [48], total - tf + 0.5, cutoff=2600) * env_exp(int((total - tf + 0.5) * SR), 0.9) * 1.4, tf)
    place(bass, bass_note(36, 1.8) * 1.3, tf)
    for buf in (drums, bass, lead):
        buf[int(tf * SR) + int(0.5 * SR):] *= 0  # nothing but the ringing chord after the hit

    # sidechain pump on chords/bass from the kick grid (bars 0-30)
    pump = np.ones(N)
    pn = int(b * SR)
    shape = 1 - 0.55 * np.exp(-np.arange(pn) / (0.09 * SR))
    for k in range(int(30 * 4)):
        i = int(k * b * SR)
        if 15 * 4 + 3 <= k < 16 * 4: continue
        pump[i:i + pn] = np.minimum(pump[i:i + pn], shape[:len(pump[i:i + pn])])
    chords *= pump; bass *= (0.5 + 0.5 * pump)

    chords = reverb(chords, 1.4, 0.3)
    lead = reverb(lead, 1.2, 0.35)
    drums = drums + 0.15 * (reverb(drums, 0.8, 1.0) - drums)
    mix = 1.0 * drums + 0.9 * bass + 0.55 * chords + 0.45 * lead + 0.8 * fx
    mix = hp(mix, 30)
    mix = mix[:int(total * SR)]
    fade = int(0.6 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade) ** 2
    mix = np.tanh(1.2 * mix / np.max(np.abs(mix)) ) * 0.9
    st = np.stack([mix, mix], 1)
    # light stereo width: delay lead/chords on the right channel
    wide = 0.12 * (np.roll(0.55 * chords[:len(mix)] + 0.45 * lead[:len(mix)], int(0.012 * SR)) - (0.55 * chords[:len(mix)] + 0.45 * lead[:len(mix)]))
    st[:, 0] -= wide; st[:, 1] += wide
    st /= np.max(np.abs(st)) / 0.89
    sf.write(out, st.astype(np.float32), SR, subtype='FLOAT')
    if stems_dir:
        os.makedirs(stems_dir, exist_ok=True)
        for name, s in dict(drums=drums, bass=bass, chords=chords, lead=lead, fx=fx).items():
            sf.write(os.path.join(stems_dir, f'{name}.wav'), (s[:int(total * SR)] / (np.max(np.abs(s)) + 1e-9) * 0.8).astype(np.float32), SR)
    print(f'music: {bpm:.3f} bpm, beat {b:.4f}s, bar {bar:.4f}s, live drop at {16*bar:.3f}s, end card at {27*bar:.3f}s, final hit {30*bar:.3f}s')


if __name__ == '__main__':
    main()
