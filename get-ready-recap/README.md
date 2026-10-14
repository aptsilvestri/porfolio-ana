# Get Ready – campaign recap (60 s, 9:16)

| Deliverable | File |
|---|---|
| **Current version (v2)** | `renders/GetReady_Recap_v2_9x16_1080x1920.mp4`: no edit-added text, new Promo 1 |
| Previous version (v1, kept) | `renders/GetReady_Recap_9x16_1080x1920.mp4` |
| v1 review render (draft quality) | `renders/GetReady_Recap_v1_review_draft.mp4` (kept local, not committed) |
| Original music track (standalone) | `renders/GetReady_music_original.m4a` |
| Edit decision list | `docs/edit_decision_list.md` · `.csv` · `docs/GetReady_Recap.edl` (CMX 3600) |
| Source transcripts (machine, Italian) | `docs/transcripts_whisper_small_it.json` |
| Editable project | `edit/` (scripted edit, details below) |

## v2 revision (what changed from v1)

1. **All text added in the edit is removed**: the opening title, section pills, live-session
   labels, captions and end-card text. Built with `build.py --no-text`. Text and logos
   that are part of the source footage are untouched: Promo 1–3's own burned-in
   captions, the YouTube session titles, and the "joinrs"/"mavriq" marks on the streams.
2. **Promo 1 replaced** with `e3e8a39e-promo_1.mp4`. The new file has the same shots and
   timing as the old one (39.2 s; frame-aligned; picture differences ≈44 dB PSNR; slightly
   different audio mix), so the same moments were kept: H4 6.63–12.83 s and C1
   0.40–0.87 s. Both cut points still fall in silence in the new audio. Its loudness
   matches the old file (same +10.2 dB gain to −16 LUFS).
3. **Nothing else changed.** The timeline, beat grid and music are identical. Every
   frame outside H4/C1 is bit-identical to v1 before titles were added. Audio outside
   H4 differs from v1 by −62 dB (a negligible shift from the global loudness
   normalisation).

v2 QC: 1080×1920, 60.000 s, 1800 frames at 30 fps, H.264 High / AAC 48 kHz,
−14.0 LUFS. True peak is −0.55 dBTP, from a transient in the new Promo 1 audio after AAC
encoding (no clipping; v1 was −1.4). No black frames, freezes or silences. A/V offset is
−5 ms (AAC delay), as in v1.

Note: the end card (0:52.5–1:00) keeps its blurred, darkened treatment. Without the text it
now plays as a dimmed blurred shot of the session. It was left as it was, per the brief.

The sections below describe v1 unless noted. The titles and captions they mention are
not in v2.

## 1. Asset inventory

The brief mentions six videos. **Five were supplied**: three promo videos and two
recordings of the live experience. The source files were left untouched.

| File | Content | Duration | Resolution / fps | Audio |
|---|---|---|---|---|
| `promo_1.mp4` (v2: `e3e8a39e-promo_1.mp4`; v1: `5fc537d0-promo_1.mp4`) | Two Joinrs hosts announce Get Ready: 15 sessions in Sept/Oct across Tech, Data, Sales, Marketing and Finance, speakers are managers + HR, a certificate and priority access | 39.2 s | 1080×1920, 30 | lav mic, clean, −23 LUFS |
| `promo_2.mp4` | Tech & Data ad (selfie talking head): "Se vuoi lavorare nel mondo tech e dei dati…", from 15 Sept, TTEP, Reale Group, Intesa Sanpaolo, Bracco | 29.7 s | 1080×1920, 30 | clean, −21 LUFS |
| `promo_3.mp4` | Finance ad, same script: from 17 Sept, CACEIS, AMCO, Allianz Trade, Bank Analyst, Tax Specialist | 31.6 s | 1080×1920, 30 | clean, −19 LUFS |
| `experience_1.mp4` | Phone recording of a laptop playing **"Depositary Bank Analyst in CACEIS \| Get Ready Finance #1"** (Joinrs YouTube) | 23.4 s | 2160×3840, 30 | laptop speakers recorded in the room, −51 LUFS, noisy |
| `experience_2.mp4` | Same setup, **"Business Analyst in Mavriq \| Get Ready Marketing&Sales #1"** | 22.7 s | 2160×3840, 30 | same, −49 LUFS |

All sources are already vertical, so nothing had to be stretched or letterboxed.
The promo videos have their own word-by-word captions burned in, so I added no
subtitles over them, which would have doubled the text.

**Editorial note:** the "live experience" footage shows **online live sessions**
(streamed and replayed on the Joinrs YouTube channel) with speakers from the partner
companies. It is not an in-person event. The recap shows them that way, with on-screen
labels taken from the real session titles.

## 2. Story (final timings)

| Section | Time | Content |
|---|---|---|
| Hook | 0:00–0:07.7 | Three one-beat flashes from the live sessions under a "GET READY" title, then promo_1: *"E la novità si chiama Get Ready… 15 appuntamenti con aziende diverse"* |
| Social promotion | 0:07.7–0:27.0 | The Tech & Data and Finance ads intercut on their shared script (problem → promise → who/when → partners → free certificate) |
| Transition | 0:27.0–0:31.1 | *"Ogni settimana saremo in diretta su Zoom per esplorare ruoli come il Bank Analyst"* → hard cut on the music drop to the **Bank Analyst / CACEIS** session |
| Live sessions | 0:31.1–0:51.0 | CACEIS (Finance #1) and Mavriq (Marketing & Sales #1): speaker greeting, panel, host with the session graphic, *"Abbiamo un quiz, abbiamo un momento un po' più interattivo"*, beat-cut montage, *"Il palco è stato scaldato perfettamente"* |
| Close | 0:51.0–1:00 | Three-beat bookend back to the promo faces, then the end card over the session footage: GET READY · Tech & Data · Marketing & Sales · Finance · Social campaign + live sessions · joinrs |

The hook runs longer than the brief's 4 s because the campaign-naming line flows straight
into what the campaign is. The transition lands at 0:27 and the live section starts at
0:31, two seconds later than the brief, so the "Bank Analyst" line can finish and land on
that exact session. Time spent per section: promo ≈ 23 s, live footage ≈ 28 s including
the hook previews and end card.

Every line keeps its original meaning. The one cross-video join (P3 → P4) puts *"Non serve
tirare a indovinare cosa cercano i recruiter"* from the Tech ad before *"Dal 17
settembre… te lo diranno"* from the Finance ad. Both ads read this same script, so the
meaning is unchanged. Section P6 ("È gratis…") is moved ahead of "Ogni settimana…".
Both are whole sentences.

## 3. Technical summary (verified on the final file)

- 1080×1920 (9:16), **60.000 s**, 1800 frames, constant 30 fps
- H.264 High@4.1, yuv420p, CRF 17, about 5.6 Mb/s, `+faststart`
- AAC-LC 256 kb/s, **48 kHz** stereo
- Loudness **−14.0 LUFS** integrated, true peak −1.4 dBFS, LRA 3.1 LU
- QC: no black frames, no freezes (ffmpeg blackdetect/freezedetect), no silences > 0.4 s
- A/V sync checked by cross-correlating the final audio against each source at every
  dialogue cut: constant −5 ms (AAC encoder delay) on every segment. The denoiser's
  25 ms latency on the live recordings is measured and compensated in `build.py`.
- Dialogue cuts were snapped to measured silences between words. The final mix was
  re-transcribed to confirm no words are clipped.

### Audio treatment
- Promo: high-pass 80 Hz, gentle compression, matched to −16 LUFS.
- Live recordings: +30 dB, 140 Hz–7.5 kHz band-limit, adaptive FFT denoise,
  compression, matched to −15.5 LUFS. They stay audibly "laptop in a room", which is
  their real character. Captions carry the key lines.
- Music is ducked 13 dB under promo dialogue and 16 dB under the live recordings,
  with 120 ms attack and 350 ms release ramps. It plays at full level in the hook,
  the beat cuts and the end card.

## 4. Asset notes – what's missing / worth improving

1. **Music.** No track was supplied, and downloading commercial music was not an option.
   So the soundtrack is an **original energetic-pop instrumental composed in code**
   (`edit/music.py`: drums, offbeat bass, pumping supersaw chords, pluck arpeggio, riser
   into the drop). It is owned outright and free of third-party rights. It is a
   functional synth track, though, not a produced library cue. For the public version
   I recommend swapping in a licensed track (Artlist, Epidemic, Musicbed…) around
   123 BPM. The edit grid (live drop on bar 16 at 0:31.1, end card on bar 27 at 0:52.5)
   was built so a replacement track can line up.
2. **Sixth video.** Only five files arrived. If a sixth promo exists, it can be
   added to the promo section by editing `edit/edl.json`.
3. **Brand assets.** No logo, font or brand guide was supplied, so I recreated no logo.
   The end card spells "joinrs" in type, in the red sampled from the Joinrs badge on the
   YouTube channel (#FF3B2A), and uses Inter. Supply the official logo (SVG/PNG) and font
   and I'll put them in.
4. **Live-session audio.** These recordings capture laptop speakers across a room. If the
   original stream recordings (YouTube/Zoom exports) are available, using their audio
   (or the stream video itself) would greatly improve clarity.
5. **Captions need a native check.** The three live-session captions were transcribed
   by machine (Whisper small, offline) and checked against the audio. Please have someone
   who was there confirm them: *"Ciao a tutti, grazie a voi per l'opportunità"*,
   *"Abbiamo un quiz, abbiamo un momento un po' più interattivo"*, *"Il palco è stato
   scaldato perfettamente"*.
6. On-screen text is in English ("CAMPAIGN RECAP", "SOCIAL CAMPAIGN", "LIVE SESSIONS",
   "Social campaign + live sessions"). It can be switched to Italian in
   `edit/build.py` (`write_ass`) if preferred.

## 5. Editable project files

This is a **scripted edit (FFmpeg + Python)**, not a native Premiere/Resolve timeline.
- `edit/edl.json`: the cut. Every clip has its source, in/out, framing (layout,
  crop centre, zoom), audio role and the reason it's in the cut. Change a time and rebuild.
- `edit/build.py`: solves the beat grid and renders segments, mix, titles and final MP4.
- `edit/music.py`: the original score, generated on the solved grid.
- `edit/titles.ass`: titles, labels and captions as generated (ASS subtitle format,
  readable in Aegisub).
- `edit/timeline_solved.json`: frame-exact timeline as rendered.
- `docs/GetReady_Recap.edl`: **CMX 3600 EDL** (video track). Import it into
  Premiere/Resolve/Avid with the five source files to rebuild the cut natively. Framing,
  titles and the mix are not carried by the EDL format.

Rebuild:
```
python3 edit/build.py <folder with the 5 source mp4s> <work dir> renders/GetReady_Recap_9x16_1080x1920.mp4
python3 edit/export_docs.py <work dir>/timeline.json docs
```
Requires ffmpeg (with libass and libx264), Python 3 with numpy, scipy and soundfile, and
the Inter font.
