"""Build the Get Ready recap from edl.json.

Pipeline (each stage writes intermediates to WORK so a revision only reruns
what changed):
  1. solve timing: beat grid such that the live sessions start on bar 16 and the
     end card on bar 27; every cut is snapped to a frame (30 fps)
  2. clean each source's audio once (48 kHz, EQ, denoise for the laptop
     recordings, loudness matched)
  3. render every segment to 1080x1920 30 fps (native / wide / screen / endcard)
  4. concat segments (stream copy)
  5. synthesise the music on the solved grid (music.py)
  6. mix dialogue + natural sound + music with ducking, master to -14 LUFS
  7. write titles / labels / captions (ASS) and encode the final MP4

usage: python3 build.py <sources_dir> <work_dir> <out.mp4> [--draft]
"""
import json, os, subprocess, sys, math
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
SR = 48000
TOTAL = 60.0
W, H = 1080, 1920
FG_W, FG_H, FG_Y = 1080, 620, 650          # screen layout: foreground box
CROP_W, CROP_H = 1360, 784                 # crop around the stream picture (4K px)

SESSION = {
    'finance':   ('Depositary Bank Analyst · CACEIS', 'Get Ready Finance #1'),
    'marketing': ('Business Analyst · Mavriq', 'Get Ready Marketing & Sales #1'),
}

# Captions only for the live-session lines (the promo videos already carry
# their own burned-in captions). Times are source seconds.
CAPTIONS = [
    ('experience_1', 2.95, 6.50, 'Ciao a tutti, grazie a voi\nper l’opportunità'),
    ('experience_2', 12.95, 15.70, 'Abbiamo un quiz, abbiamo un momento\nun po’ più interattivo'),
    ('experience_2', 20.10, 22.55, 'Il palco è stato scaldato\nperfettamente'),
]

LOUD_TARGET = {'promo': -16.0, 'experience': -15.5}


def run(cmd, quiet=True):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(' '.join(cmd)); print(r.stderr[-3000:]); sys.exit(1)
    return r


def fq(t):
    return round(t * FPS) / FPS


def probe_duration(path):
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(r.stdout.strip())


# ---------------------------------------------------------------- 1. timing
def solve(edl, src_dir):
    segs = edl['segments']
    # durations of segments with explicit in/out (frame-quantised)
    def fixed(s):
        return fq(s['out']) - fq(s['in'])
    pre_live = [s for s in segs if s['section'] in ('hook', 'promo', 'transition')]
    D1 = sum(fixed(s) for s in pre_live if 'beats' not in s)
    nbeat_hook = sum(s['beats'] for s in pre_live if 'beats' in s)
    b = (D1 + nbeat_hook * 0.5) / 64
    for _ in range(5):
        F = fq(nbeat_hook * b)
        b = (F + D1) / 64
    bar = 4 * b
    live_start, card_start = 16 * bar, 27 * bar
    # place segments
    t = 0.0
    beat_k = 0
    out = []
    close_beats = [s for s in segs if s['section'] == 'close' and 'beats' in s]
    close_start = card_start - sum(s['beats'] for s in close_beats) * b
    for i, s in enumerate(segs):
        s = dict(s)
        if s['section'] == 'hook' and 'beats' in s:
            beat_k += s['beats']
            end = fq(beat_k * b)
        elif s['section'] == 'live' and s.get('fit'):
            # beat segments in live section: one beat each, frame-quantised
            rest = 0.0
            for r in segs[i + 1:]:
                if r['section'] != 'live': break
                rest += fq(r['beats'] * b) if 'beats' in r else fixed(r)
            end = fq(close_start - rest)
        elif s['section'] == 'close' and 'beats' in s:
            k = round((t - close_start) / b)
            end = fq(close_start + (k + s['beats']) * b)
        elif s.get('out') == 'END':
            end = TOTAL
        elif 'beats' in s:
            end = t + fq(s['beats'] * b)
        else:
            end = t + fixed(s)
        end = fq(end)
        s['t0'], s['t1'] = round(t, 4), round(end, 4)
        s['dur'] = round(end - t, 4)
        s['in'] = fq(s['in'])
        s['src_out'] = round(s['in'] + s['dur'], 4)
        out.append(s)
        t = end
    assert abs(t - TOTAL) < 1e-6, t
    # sanity: fit segment must not exceed its source range
    for s in out:
        dur_src = probe_duration(os.path.join(src_dir, edl['sources'][s['src']]))
        assert s['src_out'] <= dur_src + 1e-3, (s['id'], s['src_out'], dur_src)
        assert s['dur'] > 0.25, s['id']
    return out, 60.0 / b, b


# ---------------------------------------------------------------- 2. audio clean
def loudness(path):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'])
    for line in r.stderr.splitlines()[::-1]:
        if line.strip().startswith('I:'):
            return float(line.split()[1])
    raise RuntimeError(path)


def clean_audio(name, src, work):
    out = os.path.join(work, f'clean_{name}.wav')
    if os.path.exists(out):
        return out
    if name.startswith('promo'):
        af = 'aresample=48000,highpass=f=80,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1'
        kind = 'promo'
    else:
        # laptop speakers recorded from across the desk: very quiet (-50 LUFS),
        # boost, band-limit to the speech range, adaptive FFT denoise, compress
        af = ('aresample=48000,volume=30dB,highpass=f=140,lowpass=f=7500,'
              'afftdn=nr=14:nf=-40:tn=1,acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2')
        kind = 'experience'
    tmp = out + '.tmp.wav'
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-af', af, '-ac', '2', '-c:a', 'pcm_f32le', tmp])
    gain = LOUD_TARGET[kind] - loudness(tmp)
    a, sr = sf.read(tmp, dtype='float32')
    assert sr == SR
    a = a.mean(axis=1) * (10 ** (gain / 20))
    # the filter chain (afftdn in particular) adds a little latency: measure it
    # against the untouched source and shift back so lip sync stays exact
    ref = os.path.join(work, f'ref_{name}.wav')
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-af', 'aresample=48000', '-ac', '1', '-c:a', 'pcm_f32le', ref])
    r = sf.read(ref, dtype='float32')[0]; os.remove(ref)
    seg_a, seg_r = a[SR:6 * SR], r[SR:6 * SR]
    lags = range(-int(0.1 * SR), int(0.1 * SR) + 1, 12)
    best = max(lags, key=lambda L: float(np.dot(seg_a, np.roll(seg_r, L))))
    if best > 0:      # processed audio is late by `best` samples
        a = np.concatenate([a[best:], np.zeros(best, np.float32)])
    elif best < 0:
        a = np.concatenate([np.zeros(-best, np.float32), a[:best]])
    print(f'  {name}: loudness gain {gain:+.1f} dB, latency fix {best / SR * 1000:+.1f} ms')
    sf.write(out, a.astype(np.float32), SR, subtype='FLOAT')
    os.remove(tmp)
    return out


# ---------------------------------------------------------------- 3. video
def vf_for(s):
    d = s['dur']
    lay = s['layout']
    if lay == 'native':
        z = s.get('zoom', 1.0)
        if z == 1.0:
            return 'scale=1080:1920:flags=lanczos,setsar=1'
        fy = s.get('fy', 0.3)
        zw, zh = int(round(W * z / 2) * 2), int(round(H * z / 2) * 2)
        return f'scale={zw}:{zh}:flags=lanczos,crop={W}:{H}:{(zw - W) // 2}:{int((zh - H) * fy)},setsar=1'
    if lay == 'wide':
        # full 4K frame with a slow 5% push-in
        return (f"scale=w='trunc(1080*(1+0.05*t/{d})/2)*2':h='trunc(1920*(1+0.05*t/{d})/2)*2':eval=frame:flags=bicubic,"
                f"crop=1080:1920:(iw-1080)/2:(ih-1920)/2,setsar=1")
    if lay == 'screen':
        cx, cy = s['cx'], s['cy']
        x0, y0 = cx - CROP_W // 2, cy - CROP_H // 2
        return (f"split[a][b];"
                f"[a]crop={CROP_W}:{CROP_H}:{x0}:{y0},scale=-2:1920,crop=1080:1920,scale=270:480,gblur=sigma=10,"
                f"eq=brightness=-0.24:saturation=1.35,scale=1080:1920:flags=bicubic,setsar=1[bg];"
                f"[b]crop={CROP_W}:{CROP_H}:{x0}:{y0},"
                f"scale=w='trunc({FG_W}*(1+0.04*t/{d})/2)*2':h='trunc({CROP_H * FG_W / CROP_W:.2f}*(1+0.04*t/{d})/2)*2':eval=frame:flags=lanczos,"
                f"crop={FG_W}:{FG_H}:(iw-{FG_W})/2:(ih-{FG_H})/2[fg];"
                f"[bg][fg]overlay=0:{FG_Y},setsar=1")
    if lay == 'endcard':
        return (f"scale=w='trunc(1080*(1+0.06*t/{d})/2)*2':h='trunc(1920*(1+0.06*t/{d})/2)*2':eval=frame:flags=bicubic,"
                f"crop=1080:1920:(iw-1080)/2:(ih-1920)/2,gblur=sigma=14,eq=brightness=-0.30:saturation=1.1,setsar=1")
    raise ValueError(lay)


def render_segment(s, src, work, draft):
    out = os.path.join(work, 'seg', f"{s['id']}.mp4")
    key = json.dumps([s, draft, vf_for(s)], sort_keys=True)
    if os.path.exists(out + '.key') and open(out + '.key').read() == key:
        return out
    n = round(s['dur'] * FPS)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f"{s['in']:.4f}", '-i', src,
           '-filter_complex', f"[0:v]{vf_for(s)},fps={FPS},format=yuv420p[v]", '-map', '[v]',
           '-frames:v', str(n), '-an', '-c:v', 'libx264', '-preset', 'veryfast' if draft else 'medium',
           '-crf', '20' if draft else '12', '-g', '30', '-r', str(FPS), out]
    run(cmd)
    open(out + '.key', 'w').write(key)
    return out


# ---------------------------------------------------------------- 6. mix
def ramp_mask(n, regions, up, down):
    m = np.zeros(n)
    for a, b in regions:
        m[max(0, int(a * SR)):min(n, int(b * SR))] = 1
    # smooth with asymmetric ramps
    out = np.zeros(n); cur = 0.0
    ku, kd = 1 / (up * SR), 1 / (down * SR)
    for i in range(n):
        tgt = m[i]
        cur = min(tgt, cur + ku) if tgt > cur else max(tgt, cur - kd)
        out[i] = cur
    return out


def mix(segs, clean, music_wav, work):
    n = int(TOTAL * SR)
    dia = np.zeros(n)
    regions = []
    for i, s in enumerate(segs):
        if s['audio'] == 'mute':
            continue
        a = sf.read(clean[s['src']], dtype='float32')[0]
        i0 = int(round(s['in'] * SR)); ln = int(round(s['dur'] * SR))
        clip = a[i0:i0 + ln].astype(np.float64)
        if len(clip) < ln:
            clip = np.pad(clip, (0, ln - len(clip)))
        if s['audio'] == 'amb':
            clip *= 10 ** (-13 / 20)
            fi = fo = int(0.08 * SR)
        else:
            fi = fo = int(0.012 * SR) if s['src'].startswith('promo') else int(0.05 * SR)
        nxt = segs[i + 1] if i + 1 < len(segs) else None
        if s.get('join'):
            fi = 0
        if nxt is not None and nxt.get('join'):
            fo = 0
        if fi: clip[:fi] *= np.linspace(0, 1, fi)
        if fo: clip[-fo:] *= np.linspace(1, 0, fo)
        t0 = int(round(s['t0'] * SR))
        dia[t0:t0 + ln] += clip[:n - t0]
        if s['audio'] == 'dia':
            regions.append((s['t0'], s['t1'], s['section']))
    # merge adjacent dialogue regions so the music doesn't bounce between lines
    merged = []
    for a, b, sec in sorted(regions):
        live = sec == 'live'
        if merged and a - merged[-1][1] < 0.6 and merged[-1][2] == live:
            merged[-1] = (merged[-1][0], max(b, merged[-1][1]), live)
        else:
            merged.append((a, b, live))
    # duck starts slightly before speech, releases after it. The live-session
    # audio is a room recording of laptop speakers, so it gets a deeper duck.
    duck_regions = [(a - 0.12, b + 0.05) for a, b, _ in merged]
    depth = np.zeros(n)
    for a, b, live in merged:
        depth[max(0, int((a - 0.5) * SR)):int((b + 0.5) * SR)] = -16.0 if live else -13.0
    m, _ = sf.read(music_wav, dtype='float32')
    m = m[:n].astype(np.float64)
    if len(m) < n: m = np.pad(m, ((0, n - len(m)), (0, 0)))
    mask = ramp_mask(n, duck_regions, up=0.12, down=0.35)
    gain = 10 ** ((depth * mask) / 20)
    music_level = 10 ** (-3.0 / 20)
    out = np.stack([dia, dia], 1) + m * (gain * music_level)[:, None]
    raw = os.path.join(work, 'mix_raw.wav')
    sf.write(raw, out.astype(np.float32), SR, subtype='FLOAT')
    # two-pass loudness normalisation to -14 LUFS / -1.5 dBTP
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'])
    js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    final = os.path.join(work, 'mix_final.wav')
    run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
         f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
         f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
         f"aresample=48000,alimiter=limit=0.84:level=false", '-c:a', 'pcm_s16le', final])
    return final, [(round(a, 3), round(b, 3)) for a, b, _ in merged]


# ---------------------------------------------------------------- 7. text
def ass_time(t):
    t = max(0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f'{h}:{m:02d}:{s:05.2f}'


def write_ass(segs, path, b):
    red = '&H002A3BFF'  # Joinrs red #FF3B2A in ASS BGR
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Inter Black,168,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,-2,0,1,0,6,5,60,60,0,1
Style: Kicker,Inter ExtraBold,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,6,0,1,0,3,5,60,60,0,1
Style: Pill,Inter ExtraBold,36,&H00FFFFFF,&H00FFFFFF,{red},{red},0,0,0,0,100,100,3,0,3,14,0,5,60,60,0,1
Style: PillDark,Inter ExtraBold,34,&H00FFFFFF,&H00FFFFFF,&H50141414,&H50141414,0,0,0,0,100,100,3,0,3,14,0,5,60,60,0,1
Style: Session,Inter Bold,40,&H00FFFFFF,&H00FFFFFF,&H40141414,&H40141414,0,0,0,0,100,100,0,0,3,12,0,5,60,60,0,1
Style: Caption,Inter Bold,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,4,2,5,70,70,0,1
Style: Line,Inter SemiBold,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,0,3,5,60,60,0,1
Style: Brand,Inter Black,78,{red},{red},&H00000000,&H64000000,0,0,0,0,100,100,-1,0,1,0,3,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    def add(t0, t1, style, x, y, text, fx='', layer=1):
        ev.append(f"Dialogue: {layer},{ass_time(t0)},{ass_time(t1)},{style},,0,0,0,,{{\\pos({x},{y}){fx}}}{text}")
    pop = '\\fscx118\\fscy118\\t(0,140,\\fscx100\\fscy100)'
    hook = [s for s in segs if s['section'] == 'hook' and 'beats' in s]
    h0, h1 = hook[0]['t0'], hook[-1]['t1']
    add(h0, h1, 'Kicker', 540, 330, 'CAMPAIGN RECAP', '\\fad(0,80)')
    add(h0, h1, 'Title', 540, 450, 'GET READY', pop + '\\fad(0,80)')

    promo = [s for s in segs if s['section'] == 'promo']
    add(promo[0]['t0'], promo[0]['t0'] + 2.6, 'PillDark', 540, 175, ' SOCIAL CAMPAIGN ', '\\fad(120,200)')

    live = [s for s in segs if s['section'] == 'live']
    add(live[0]['t0'], live[0]['t0'] + 2.4, 'Pill', 540, 175, ' LIVE SESSIONS ', '\\fad(80,200)')
    # session label: one per run of segments with the same label
    runs = []
    for s in live:
        lab = s.get('label')
        if runs and runs[-1][0] == lab:
            runs[-1][2] = s['t1']; runs[-1][3].append(s)
        else:
            runs.append([lab, s['t0'], s['t1'], [s]])
    for lab, t0, t1, ss in runs:
        if not lab: continue
        title, series = SESSION[lab]
        for s in ss:
            y = 300 if s['layout'] == 'wide' else 520
            ytxt = y + 70
            fade = '\\fad(150,0)' if s is ss[0] else ''
            add(s['t0'], s['t1'], 'Pill', 540, y, f' {series.upper()} ', fade)
            add(s['t0'], s['t1'], 'Session', 540, ytxt, title, fade)

    # captions, mapped from source time to timeline time per segment
    for src, a, bb, text in CAPTIONS:
        for s in segs:
            if s['src'] != src or s['audio'] != 'dia':
                continue
            lo, hi = max(a, s['in']), min(bb, s['src_out'])
            if hi - lo < 0.2:
                continue
            t0 = s['t0'] + (lo - s['in']); t1 = s['t0'] + (hi - s['in'])
            y = 1400
            add(t0, t1, 'Caption', 540, y, text.replace('\n', '\\N'), layer=2)

    card = segs[-1]
    c0 = card['t0']
    end_fade = '\\fad(0,450)'
    add(c0, TOTAL, 'Kicker', 540, 700, 'CAMPAIGN RECAP', end_fade)
    add(c0, TOTAL, 'Title', 540, 830, 'GET READY', pop + end_fade)
    add(c0 + 2 * b, TOTAL, 'Line', 540, 980, 'Tech & Data  ·  Marketing & Sales  ·  Finance', '\\fad(200,450)')
    add(c0 + 2 * b, TOTAL, 'Line', 540, 1045, 'Social campaign + live sessions', '\\fad(200,450)')
    add(c0 + 4 * b, TOTAL, 'Brand', 540, 1230, 'joinrs', '\\fad(200,450)')
    # merge identical consecutive pill/session events is unnecessary; libass draws them seamlessly
    open(path, 'w').write(hdr + '\n'.join(ev) + '\n')


# ---------------------------------------------------------------- main
def main():
    src_dir, work, out = sys.argv[1], sys.argv[2], sys.argv[3]
    draft = '--draft' in sys.argv
    os.makedirs(os.path.join(work, 'seg'), exist_ok=True)
    edl = json.load(open(os.path.join(HERE, 'edl.json')))
    segs, bpm, b = solve(edl, src_dir)
    json.dump({'bpm': bpm, 'beat': b, 'segments': segs}, open(os.path.join(work, 'timeline.json'), 'w'), indent=1)
    for s in segs:
        print(f"{s['id']:3} {s['t0']:6.2f}-{s['t1']:6.2f} ({s['dur']:4.2f}s)  {s['src']:12} {s['in']:6.2f}-{s['src_out']:6.2f}  {s['layout']:7} {s['audio']}")
    clean = {k: clean_audio(k, os.path.join(src_dir, v), work) for k, v in edl['sources'].items()}
    files = [render_segment(s, os.path.join(src_dir, edl['sources'][s['src']]), work, draft) for s in segs]
    lst = os.path.join(work, 'concat.txt')
    open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
    video = os.path.join(work, 'video.mp4')
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', video])
    music = os.path.join(work, 'music.wav')
    run(['python3', '-I', os.path.join(HERE, 'music.py'), f'{bpm:.6f}', str(TOTAL), music, os.path.join(work, 'stems')])
    final_wav, dia_regions = mix(segs, clean, music, work)
    ass = os.path.join(work, 'titles.ass')
    write_ass(segs, ass, b)
    fontsdir = '/usr/share/fonts/opentype/inter'
    run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-i', final_wav,
         '-filter_complex', f"[0:v]subtitles={ass}:fontsdir={fontsdir},fade=t=out:st={TOTAL - 0.5}:d=0.5,format=yuv420p[v]",
         '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'veryfast' if draft else 'slow',
         '-crf', '23' if draft else '17', '-profile:v', 'high', '-level', '4.1', '-r', str(FPS),
         '-g', '60', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart',
         '-t', str(TOTAL), out])
    json.dump({'bpm': bpm, 'beat': b, 'dialogue_regions': dia_regions, 'segments': segs},
              open(os.path.join(work, 'timeline.json'), 'w'), indent=1)
    print('wrote', out, f'bpm={bpm:.3f}')


if __name__ == '__main__':
    main()
