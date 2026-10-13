import contextlib
import copy
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
from graphics_config import validate_theme, load_graphics_theme
from lint_plan import lint

class GraphicsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.plan = self.root / 'broll_plan.json'
        self.beat = {"kind": "object_transform", "start_sec": 8, "end_sec": 14,
                     "reason": "Các tài liệu chuyển về một kho tri thức chung.",
                     "objects": [{"id": "a", "label": "Giáo án", "appear_sec": 8.2},
                                 {"id": "b", "label": "Bài tập", "appear_sec": 9.0}],
                     "target_label": "Kho tri thức", "gather_sec": 11.0}
    def tearDown(self):
        self.temp.cleanup()
    def check(self, beat):
        self.plan.write_text(json.dumps([beat]))
        with contextlib.redirect_stdout(io.StringIO()), patch.dict(os.environ, {}, clear=True):
            return lint(self.plan)
    def test_theme_override_precedence(self):
        (self.root/'edit_options.json').write_text(json.dumps({'graphics_theme':'warm-story'}))
        config = self.root/'theme.json';config.write_text(json.dumps({'preset':'light-minimal','backgroundStyle':'grid','accent':'#FF0000'}))
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(load_graphics_theme(self.root,self.root)['preset'],'warm-story')
        with patch.dict(os.environ, {'VIDEO_EDIT_GRAPHICS_THEME':'henry-brand'}, clear=True):
            self.assertEqual(load_graphics_theme(self.root,self.root)['preset'],'henry-brand')
        with patch.dict(os.environ, {'VIDEO_EDIT_GRAPHICS_THEME':'henry-brand','VIDEO_EDIT_GRAPHICS_CONFIG':str(config)}, clear=True):
            self.assertEqual(load_graphics_theme(self.root,self.root)['preset'],'light-minimal')
    def test_legacy_without_new_options(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(load_graphics_theme(self.root,self.root), {'preset':'legacy-lime'})
    def test_invalid_theme_rejected(self):
        for config in ['missing',{'accent':'red'},{'backgroundStyle':'rainbow'},{'motion':'too-fast'},{'fontFamily':''},{'captionColor':'#FFFFFF'}]:
            with self.subTest(config=config), self.assertRaises(ValueError): validate_theme(config)
    def test_collect_and_pipeline_pass(self):
        self.assertEqual(self.check(self.beat),0)
        b=copy.deepcopy(self.beat);b['transform_mode']='pipeline';self.assertEqual(self.check(b),0)
    def test_timing_requires_completed_transform(self):
        for changes in [{'gather_sec':13.3},{'gather_sec':float('nan')}]:
            b=copy.deepcopy(self.beat);b.update(changes);self.assertEqual(self.check(b),1)
        b=copy.deepcopy(self.beat);b['objects'][0]['transform_sec']=8.3;self.assertEqual(self.check(b),1)
        b=copy.deepcopy(self.beat);b['objects'][1]['appear_sec']=15;self.assertEqual(self.check(b),1)
    def test_objects_require_unique_ids_and_nonempty_labels(self):
        b=copy.deepcopy(self.beat);b['objects'][1]['id']='a';self.assertEqual(self.check(b),1)
        b=copy.deepcopy(self.beat);b['objects'][0]['label']='';self.assertEqual(self.check(b),1)
        b=copy.deepcopy(self.beat);b['objects']*=4;self.assertEqual(self.check(b),1)
    def test_speaker_requires_valid_visual(self):
        b={'kind':'speaker_canvas','start_sec':8,'end_sec':14,'reason':'Người nói giải thích trong khung riêng.',
           'elements':[{'id':'a','label':'Dữ liệu','x':0.2,'y':0.5,'appear_sec':8.2},
                       {'id':'b','label':'Trợ lý','x':0.7,'y':0.5,'appear_sec':9.2}],
           'connectors':[{'from':'a','to':'b','appear_sec':9.3}]}
        self.assertEqual(self.check(b),0)
        broken=copy.deepcopy(b);broken['connectors'][0]['to']='missing';self.assertEqual(self.check(broken),1)
        broken=copy.deepcopy(b);broken['elements'][0]['x']=2;self.assertEqual(self.check(broken),1)
        broken=copy.deepcopy(b);broken['overlay']=True;self.assertEqual(self.check(broken),1)
    def test_per_beat_theme_survives(self):
        b=copy.deepcopy(self.beat);b['graphics_theme']={'preset':'dark-tech','backgroundStyle':'grid'};self.assertEqual(self.check(b),0)
        b['graphics_theme']={'preset':'bad'};self.assertEqual(self.check(b),1)

if __name__=='__main__': unittest.main()
