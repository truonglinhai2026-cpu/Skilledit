#!/usr/bin/env python3
"""Verify an exported preview/final against its source."""
from __future__ import annotations
import argparse
import json
import subprocess
from pathlib import Path


def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def probe(path):
    return json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]))


def audio_md5(path):
    return run(['ffmpeg','-v','error','-i',str(path),'-vn','-c:a','pcm_s16le','-f','md5','-']).strip()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    parser.add_argument('--output',type=Path)
    parser.add_argument('--allow-audio-mix',action='store_true')
    parser.add_argument('--report',type=Path)
    args=parser.parse_args()
    src=args.source.expanduser().resolve()
    out=args.output.expanduser().resolve() if args.output else src.with_name(f'{src.stem}.preview.mp4')
    if not out.exists():
        print(f'[verify] FAIL: output missing: {out}')
        return 1
    a,b=probe(src),probe(out)
    sv=next(s for s in a['streams'] if s['codec_type']=='video')
    ov=next(s for s in b['streams'] if s['codec_type']=='video')
    def fps(stream):
        n,d=stream['avg_frame_rate'].split('/')
        return float(n)/float(d)
    sd=float(sv.get('duration',a['format']['duration']))
    od=float(ov.get('duration',b['format']['duration']))
    duration_ok=abs(sd-od)<=1/fps(sv)+1e-6
    run(['ffmpeg','-v','error','-xerror','-i',str(out),'-f','null','-'])
    sa=any(s['codec_type']=='audio' for s in a['streams'])
    oa=any(s['codec_type']=='audio' for s in b['streams'])
    audio_ok=sa==oa
    original_hash=output_hash=None
    if sa and oa and not args.allow_audio_mix:
        original_hash,output_hash=audio_md5(src),audio_md5(out)
        audio_ok=original_hash==output_hash
    report={'source':str(src),'output':str(out),'source_duration_sec':sd,'output_duration_sec':od,
            'duration_within_one_source_frame':duration_ok,'full_decode':'passed',
            'audio_check':'mix_requested_requires_listening' if args.allow_audio_mix else 'identical' if audio_ok else 'different',
            'source_audio_pcm_md5':original_hash,'output_audio_pcm_md5':output_hash,
            'width':ov['width'],'height':ov['height'],'fps':fps(ov),'frames':ov.get('nb_frames')}
    if args.report:
        args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f"[verify] {ov['width']}x{ov['height']}, {od:.3f}s; duration {'PASS' if duration_ok else 'FAIL'}; decode PASS; audio {report['audio_check']}")
    if not audio_ok and not args.allow_audio_mix:
        print('[verify] Audio differs; for a deliberately mixed/re-encoded source, inspect and declare --allow-audio-mix.')
    return 0 if duration_ok and audio_ok else 1


if __name__=='__main__':
    raise SystemExit(main())
