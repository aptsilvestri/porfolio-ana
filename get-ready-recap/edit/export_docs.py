"""Write the edit decision list (Markdown table, CSV and a CMX 3600 .edl) from
the solved timeline that build.py saves.

usage: python3 export_docs.py <work_dir/timeline.json> <out_dir>
"""
import csv, json, os, sys

FPS = 30


def tc(t):
    f = round(t * FPS)
    return f'{f // (3600 * FPS):02d}:{f // (60 * FPS) % 60:02d}:{f // FPS % 60:02d}:{f % FPS:02d}'


def mmss(t):
    return f'{int(t // 60)}:{t % 60:05.2f}'


def main():
    tl = json.load(open(sys.argv[1])); out = sys.argv[2]
    edl = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'edl.json')))
    segs = tl['segments']
    names = {'hook': 'Opening hook', 'promo': 'Social media promotion', 'transition': 'Transition to live',
             'live': 'Get Ready live sessions', 'close': 'Closing'}
    rows = []
    md = ['# Edit decision list - Get Ready recap', '',
          f"Timeline 1080x1920, 30 fps, 60.00 s. Music grid {tl['bpm']:.2f} BPM (live sessions start on bar 16, end card on bar 27).", '',
          'Source times are in seconds of the original upload. Audio: **dia** = original dialogue at full level, '
          '**amb** = natural sound low under the music, **mute** = picture only.', '']
    sec = None
    for i, s in enumerate(segs, 1):
        if s['section'] != sec:
            sec = s['section']
            md += ['', f'## {names[sec]}', '', '| # | Timeline | Source | Source in-out | Layout | Audio | Why it is in the cut |', '|---|---|---|---|---|---|---|']
        src = edl['sources'][s['src']]
        md.append(f"| {s['id']} | {mmss(s['t0'])}-{mmss(s['t1'])} | `{src}` | {s['in']:.2f}-{s['src_out']:.2f} | {s['layout']} | {s['audio']} | {s['why']} |")
        rows.append([s['id'], s['section'], f"{s['t0']:.3f}", f"{s['t1']:.3f}", src, f"{s['in']:.3f}", f"{s['src_out']:.3f}", s['layout'], s['audio'], s['why']])
    open(os.path.join(out, 'edit_decision_list.md'), 'w').write('\n'.join(md) + '\n')
    with open(os.path.join(out, 'edit_decision_list.csv'), 'w', newline='') as f:
        w = csv.writer(f); w.writerow(['id', 'section', 'timeline_in', 'timeline_out', 'source', 'source_in', 'source_out', 'layout', 'audio', 'reason']); w.writerows(rows)
    # CMX 3600 (video track), for re-conforming the cut in Premiere / Resolve / Avid
    lines = ['TITLE: GET READY RECAP', 'FCM: NON-DROP FRAME', '']
    for i, s in enumerate(segs, 1):
        reel = s['src'].upper().replace('EXPERIENCE_', 'EXP').replace('_', '')
        lines.append(f"{i:03d}  {reel:<8} V     C        {tc(s['in'])} {tc(s['src_out'])} {tc(s['t0'])} {tc(s['t1'])}")
        lines.append(f"* FROM CLIP NAME: {edl['sources'][s['src']]}")
        lines.append(f"* {s['id']} {s['layout'].upper()} AUDIO={s['audio'].upper()}")
        lines.append('')
    open(os.path.join(out, 'GetReady_Recap.edl'), 'w').write('\n'.join(lines))
    print('docs written to', out)


if __name__ == '__main__':
    main()
