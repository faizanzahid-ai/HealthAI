import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
import torch
import torch.nn as nn
import os
import tempfile
import time
import plotly.graph_objects as go
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from PIL import Image

# --- Page Config ---
st.set_page_config(page_title="Tennis Pro - Form Analysis", page_icon="🎾", layout="wide")

# --- Custom Styling ---
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@500;700&display=swap');
    
    :root {
        --primary: #c2ff00; /* Tennis Ball Neon */
        --bg: #0a0b10;
        --card: rgba(30, 33, 48, 0.4);
        --text: #ffffff;
    }

    .stApp {
        background-color: var(--bg);
        color: var(--text);
        font-family: 'Inter', sans-serif;
    }

    /* Full Width & Padding Fix - Maximum Aggression */
    .main .block-container {
        max-width: 100% !important;
        width: 100% !important;
        padding-top: 2rem !important;
        padding-right: 2rem !important;
        padding-left: 1.5rem !important;
        padding-bottom: 3rem !important;
    }

    [data-testid="stVerticalBlock"] > div:has([data-testid="column"]) {
        width: 100% !important;
        max-width: none !important;
    }

    /* Force Tabs to fill width */
    .stTabs [data-baseweb="tab-panel"] {
        width: 100% !important;
        max-width: none !important;
    }
    
    [data-testid="stHorizontalBlock"] {
        width: 100% !important;
        gap: 1.5rem !important;
    }

    div.block-container {
        max-width: 100% !important;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0d0f1a 0%, #10121c 100%) !important;
        border-right: 1px solid rgba(194,255,0,0.12) !important;
        padding-top: 1rem !important;
    }
    [data-testid="stSidebarNav"] { display: none; }
    /* Prevent main content from sliding left under sidebar */
    section[data-testid="stSidebarContent"] { padding-top: 1rem; }

    /* Professional Headings */
    h1, h2, h3 { 
        font-family: 'Outfit', sans-serif !important;
        font-weight: 700 !important;
        background: linear-gradient(90deg, #c2ff00 0%, #00d4ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.02em;
    }

    /* Metric Cards — Premium */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, rgba(30,33,48,0.85) 0%, rgba(18,20,30,0.9) 100%) !important;
        border: 1px solid rgba(194, 255, 0, 0.25) !important;
        padding: 22px 18px !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05) !important;
        backdrop-filter: blur(12px) !important;
        text-align: center;
        transition: border-color 0.3s ease;
    }
    div[data-testid="stMetric"]:hover {
        border-color: rgba(194, 255, 0, 0.55) !important;
    }
    div[data-testid="stMetricLabel"] > div {
        color: rgba(255,255,255,0.55) !important;
        font-size: 0.75rem !important;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: 'Inter', sans-serif !important;
        -webkit-text-fill-color: rgba(255,255,255,0.55) !important;
    }
    div[data-testid="stMetricValue"] {
        color: var(--primary) !important;
        -webkit-text-fill-color: var(--primary) !important;
        font-family: 'Outfit', sans-serif !important;
        font-size: 2rem !important;
        font-weight: 800 !important;
        line-height: 1.1;
    }
    div[data-testid="stMetricDelta"] { display: none; }

    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #c2ff00 0%, #a8dc00 100%) !important;
        color: #000 !important;
        border: none !important;
        font-weight: 800 !important;
        border-radius: 12px !important;
        padding: 0.6rem 2rem !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    .stButton > button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(194, 255, 0, 0.4);
    }

    /* Left Align Video Player */
    [data-testid="stVideo"], .stVideo {
        display: flex !important;
        justify-content: flex-start !important;
        margin-left: 0 !important;
        margin-right: auto !important;
    }

    /* Success/Error Banners */
    .stAlert {
        border-radius: 12px !important;
        background: rgba(30, 33, 48, 0.7) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    /* Legend Styles */
    .legend-item { display: flex; align-items: center; margin-bottom: 5px; font-size: 0.85em; }
    .legend-color { width: 12px; height: 12px; border-radius: 50%; margin-right: 10px; }
    
</style>
""", unsafe_allow_html=True)

# --- Model Definition ---
class LSTMAutoencoder(nn.Module):
    def __init__(self, seq_len, n_features, hidden_dim=64):
        super(LSTMAutoencoder, self).__init__()
        self.seq_len = seq_len
        self.n_features = n_features
        self.hidden_dim = hidden_dim
        self.encoder = nn.LSTM(n_features, hidden_dim, batch_first=True)
        self.decoder = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)
        self.output_layer = nn.Linear(hidden_dim, n_features)

    def forward(self, x):
        _, (hidden, _) = self.encoder(x)
        hidden = hidden.transpose(0, 1)
        decoder_input = hidden.repeat(1, self.seq_len, 1)
        decoder_output, _ = self.decoder(decoder_input)
        return self.output_layer(decoder_output)

# --- Configuration ---
ORDERED_KEYS = [
    'Right Ankle', 'Right Knee', 'Right Hip', 'Left Hip', 'Left Knee', 'Left Ankle', 
    'Pelvis', 'Thorax', 'Upper Neck', 'Head Top', 'Right Wrist', 'Right Elbow', 
    'Right Shoulder', 'Left Shoulder', 'Left Elbow', 'Left Wrist'
]

# Display order for the analytics graph (Top-to-Bottom)
GRAPH_ORDER = [
    'Head Top', 'Upper Neck', 'Thorax', 'Right Shoulder', 'Right Elbow', 'Right Wrist',
    'Left Shoulder', 'Left Elbow', 'Left Wrist', 'Pelvis', 'Right Hip', 'Right Knee',
    'Right Ankle', 'Left Hip', 'Left Knee', 'Left Ankle'
]

LANDMARK_MAP = {
    'Right Ankle': 28, 'Right Knee': 26, 'Right Hip': 24, 'Left Hip': 23, 
    'Left Knee': 25, 'Left Ankle': 27, 'Right Wrist': 16, 'Right Elbow': 14, 
    'Right Shoulder': 12, 'Left Shoulder': 11, 'Left Elbow': 13, 'Left Wrist': 15, 
    'Nose': 0
}

JOINT_COLORS = {
    'Head Top': (255, 0, 0), 'Upper Neck': (255, 87, 34), 'Thorax': (255, 193, 7),
    'Right Shoulder': (76, 175, 80), 'Right Elbow': (0, 150, 136), 'Right Wrist': (0, 188, 212),
    'Left Shoulder': (33, 150, 243), 'Left Elbow': (63, 81, 181), 'Left Wrist': (103, 58, 183),
    'Pelvis': (156, 39, 176), 'Right Hip': (233, 30, 99), 'Right Knee': (255, 152, 0),
    'Right Ankle': (139, 69, 19), 'Left Hip': (0, 255, 255), 'Left Knee': (0, 255, 0),
    'Left Ankle': (255, 0, 255)
}

WEAK_POINT_MESSAGES = {
    'Right Knee': 'Knee bend is insufficient', 'Left Knee': 'Knee bend is insufficient',
    'Right Elbow': 'Elbow is not fully extended', 'Left Elbow': 'Elbow is not fully extended',
    'Right Shoulder': 'Shoulder rotation is insufficient', 'Left Shoulder': 'Shoulder rotation is insufficient',
    'Thorax': 'Thorax/Back alignment is off', 'Pelvis': 'Pelvis positioning is off',
    'Right Wrist': 'Wrist stability is insufficient', 'Left Wrist': 'Wrist stability is insufficient',
    'Right Ankle': 'Ankle/Foot positioning is poor', 'Left Ankle': 'Ankle/Foot positioning is poor',
    'Upper Neck': 'Neck alignment is insufficient', 'Head Top': 'Head posture is poor',
    'Right Hip': 'Hips rotation is insufficient', 'Left Hip': 'Hips rotation is insufficient'
}

# --- Sidebar Navigation ---
with st.sidebar:
    st.markdown("""
    <div style='text-align:center; padding: 10px 0 20px 0;'>
        <div style='font-size:2.5rem;'>🎾</div>
        <h2 style='margin:4px 0 2px 0; font-size:1.3rem; letter-spacing:0.08em;'>TENNIS PRO</h2>
        <p style='color:rgba(255,255,255,0.35); font-size:0.7rem; letter-spacing:0.15em; margin:0;'>AI MOTION ANALYTICS</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")

    nav_options = ["📊 Form Analysis", "🎾 Training Drills", "🎥 Live Coaching", "👤 Profile", "📁 Post Hoc"]
    app_mode = st.radio("SELECT MODULE", nav_options, index=0, label_visibility="visible")

    st.markdown("---")
    st.markdown("<p style='color:rgba(255,255,255,0.4); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.12em;'>Tracking Legend</p>", unsafe_allow_html=True)
    for joint, color in JOINT_COLORS.items():
        rgb = f"rgb({color[0]},{color[1]},{color[2]})"
        st.markdown(f"""<div class='legend-item'><div class='legend-color' style='background:{rgb};flex-shrink:0;'></div><span style='color:rgba(255,255,255,0.65);font-size:0.78em;'>{joint}</span></div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.caption("AI Motion Engine v2.1")


# --- Helper Functions ---
@st.cache_resource
def load_models():
    if not os.path.exists("tennis_lstm_model.pth"):
        return None, None
    
    device = torch.device("cpu")
    n_features = len(ORDERED_KEYS) * 3
    model = LSTMAutoencoder(30, n_features)
    model.load_state_dict(torch.load("tennis_lstm_model.pth", map_location=device))
    model.to(device).eval()
    
    # We only cache the image detector (stateless) and the PyTorch model
    base_options = python.BaseOptions(model_asset_path='pose_landmarker_heavy.task')
    image_options = vision.PoseLandmarkerOptions(base_options=base_options, running_mode=vision.RunningMode.IMAGE)
    image_detector = vision.PoseLandmarker.create_from_options(image_options)
    
    return model, image_detector

def get_backside_nodes(landmarks):
    nodes = {}
    for key, idx in LANDMARK_MAP.items():
        lm = landmarks[idx]
        nodes[key] = [lm.x, lm.y, lm.z]
    nodes['Pelvis'] = [(nodes['Left Hip'][i] + nodes['Right Hip'][i]) / 2 for i in range(3)]
    nodes['Thorax'] = [(nodes['Left Shoulder'][i] + nodes['Right Shoulder'][i]) / 2 for i in range(3)]
    nodes['Upper Neck'] = [(nodes['Thorax'][i] + nodes['Nose'][i]) / 2 for i in range(3)]
    nodes['Head Top'] = [nodes['Nose'][0], nodes['Nose'][1] - abs(nodes['Nose'][1] - nodes['Thorax'][1]) * 0.5, nodes['Nose'][2]]
    return nodes

def draw_styled_skeleton(image, nodes_dict, joint_errors=None):
    h, w, c = image.shape
    pixel_nodes = {}
    for key, coords in nodes_dict.items():
        px, py = int(coords[0] * w), int(coords[1] * h)
        pixel_nodes[key] = (px, py)
        # Use joint-specific colors
        color = JOINT_COLORS.get(key, (255, 255, 255))
        cv2.circle(image, (px, py), 8, color[::-1], -1) # BGR conversion
    
    connections = [
        ('Right Ankle', 'Right Knee'), ('Right Knee', 'Right Hip'), ('Right Hip', 'Pelvis'),
        ('Left Ankle', 'Left Knee'), ('Left Knee', 'Left Hip'), ('Left Hip', 'Pelvis'),
        ('Pelvis', 'Thorax'), ('Thorax', 'Upper Neck'), ('Upper Neck', 'Head Top'),
        ('Thorax', 'Right Shoulder'), ('Right Shoulder', 'Right Elbow'), ('Right Elbow', 'Right Wrist'),
        ('Thorax', 'Left Shoulder'), ('Left Shoulder', 'Left Elbow'), ('Left Elbow', 'Left Wrist')
    ]
    for start_node, end_node in connections:
        if start_node in pixel_nodes and end_node in pixel_nodes:
            cv2.line(image, pixel_nodes[start_node], pixel_nodes[end_node], (150, 150, 150), 3)

    # Print weak points on posture if provided
    if joint_errors is not None:
        y_offset = 40
        for idx, joint in enumerate(ORDERED_KEYS):
            if joint_errors[idx] > 0.05: # Lowered threshold for frame-specific alerts
                msg = WEAK_POINT_MESSAGES.get(joint, joint)
                cv2.putText(image, f"! {msg}", (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                y_offset += 30
                # Draw a red ring around the problematic joint
                if joint in pixel_nodes:
                    cv2.circle(image, pixel_nodes[joint], 15, (0, 0, 255), 2)

    return image

# --- Main App ---
def main():
    if 'app_mode' not in dir():
        pass  # app_mode is set globally via sidebar
    if app_mode == "📊 Form Analysis":
        analysis_page()
    else:
        coming_soon_page(app_mode)

def coming_soon_page(title):
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, rgba(30,33,48,0.6) 0%, rgba(18,20,30,0.8) 100%); padding: 60px 40px; border-radius: 24px; text-align: center; border: 1px dashed rgba(194,255,0,0.25); margin-top:2rem;">
        <div style='font-size:3rem; margin-bottom:12px;'>🚧</div>
        <h2 style='margin-bottom: 14px;'>Under Construction</h2>
        <p style='color:rgba(255,255,255,0.45); font-size:1.05em;'>The <strong>{title}</strong> module is being calibrated.<br>Check back soon.</p>
    </div>
    """, unsafe_allow_html=True)

def analysis_page():
    # Page header
    st.markdown("<h1 style='margin-bottom:0;'>🎾 Form Analysis</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:rgba(255,255,255,0.4);margin-top:4px;margin-bottom:1.5rem;font-size:0.9rem;'>Upload your match footage and receive AI-powered posture coaching.</p>", unsafe_allow_html=True)

    # Hero metrics row
    mc1, mc2, mc3 = st.columns(3)
    mc1.metric("Standard", "ATP Pro")
    mc2.metric("Confidence", "98.4%")
    mc3.metric("Mode", "Full Frame")

    st.markdown("<br>", unsafe_allow_html=True)

    # Balanced ratio with medium gap for better breathing space
    upload_col, dash_col = st.columns([1.3, 1], gap="medium")

    with upload_col:
        st.markdown("#### 📤 Upload Movement")
        uploaded_file = st.file_uploader("", type=["mp4", "mov", "avi"], label_visibility="collapsed")
        
        if uploaded_file:
            tfile = tempfile.NamedTemporaryFile(delete=False) 
            tfile.write(uploaded_file.read())
            st.video(tfile.name)
            if st.button("🚀 RUN AI ANALYTICS"):
                with st.spinner("Decoding motion patterns..."):
                    analyze_video_flow(tfile.name)
        else:
            st.info("👋 Select a video file to begin professional analysis.")

    with dash_col:
        st.markdown("#### 📈 Analytics Dashboard")
        st.markdown("""
        <div style="min-height:220px; display:flex; align-items:center; justify-content:center;
                    background:rgba(255,255,255,0.02); border-radius:20px;
                    border:1px dashed rgba(255,255,255,0.08);">
            <p style="color:rgba(255,255,255,0.25); font-size:0.95em; text-align:center;">
                📊<br>Upload a video to populate<br>technical statistics here.
            </p>
        </div>
        """, unsafe_allow_html=True)

def analyze_video_flow(video_path):
    model, image_detector = load_models()
    if not model:
        st.error("AI Models failed to load. Please ensure 'tennis_lstm_model.pth' and 'pose_landmarker_heavy.task' are present.")
        return

    # Fresh detector for every run to ensure temporal consistency
    base_options = python.BaseOptions(model_asset_path='pose_landmarker_heavy.task')
    video_options = vision.PoseLandmarkerOptions(base_options=base_options, running_mode=vision.RunningMode.VIDEO)
    video_detector = vision.PoseLandmarker.create_from_options(video_options)

    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps

    # Processing Configuration
    skip_factor = 1 # Reverted to frame-by-frame for maximum precision
    process_h = 720 # Increased resolution for clearer/larger video analysis
    stride = 8 if duration < 30 else 15 # Standard stride for full-fidelity analysis

    scale = process_h / h if h > process_h else 1.0
    process_w = int(w * scale)
    
    frames_features = []
    processed_frames = []
    
    mode_text = "Neural Motion Calibration"
    progress_bar = st.progress(0, text=f"Processing Frame 0 / {total_frames}")
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Frame-by-frame processing enabled
            
        ts = int(frame_count * (1000 / fps))
        
        # Resize for MediaPipe speedup
        if scale < 1.0:
            frame_small = cv2.resize(frame, (process_w, process_h))
        else:
            frame_small = frame
            
        img_rgb = cv2.cvtColor(frame_small, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        
        res = video_detector.detect_for_video(mp_img, ts)
        if res.pose_landmarks:
            nodes = get_backside_nodes(res.pose_landmarks[0])
            vector = []
            for k in ORDERED_KEYS: vector.extend(nodes[k])
            frames_features.append(vector)
            
            # Annotate a downscaled frame for the final video output (faster write)
            annotated_frame = draw_styled_skeleton(frame_small.copy(), nodes)
            processed_frames.append(annotated_frame)
        
        frame_count += 1
        done = frame_count
        left = total_frames - done
        if frame_count % 5 == 0:
            progress_bar.progress(min(1.0, frame_count / total_frames), 
                                 text=f"Processing: {done} Done | {max(0, left)} Left (Total: {total_frames})")

    cap.release()
    
    if not processed_frames:
        st.error("❌ Motion Capture Error: Subject not identified in neural layer.")
        return

    # Video Encoding (Using the optimized resolution)
    annotated_video_path = f"annotated_output_{int(time.time())}.mp4"
    writer_initialized = False
    for codec in ['avc1', 'mp4v', 'XVID']:
        fourcc = cv2.VideoWriter_fourcc(*codec)
        # Adjust FPS to match processed count
        out = cv2.VideoWriter(annotated_video_path, fourcc, max(1, fps // skip_factor), (process_w, process_h))
        if out.isOpened():
            writer_initialized = True
            break
    
    if writer_initialized:
        for f in processed_frames: out.write(f)
        out.release()

    # AI Deep Inference
    effective_seq_len = 30 # Fully sequential model window
    if len(frames_features) < effective_seq_len:
        st.warning(f"⚠️ Insufficient frames ({len(frames_features)}/{effective_seq_len}) for AI sequence analysis.")
        return

    # Windowing with standard stride
    X = np.array([frames_features[i:i+effective_seq_len] for i in range(0, len(frames_features)-effective_seq_len+1, stride)])
    
    # No upsampling needed for frame-by-frame, but keeping variable names for consistency
    X_upsampled = X 
    
    X_t = torch.FloatTensor(X_upsampled)
    with torch.no_grad(): rec = model(X_t).numpy()
    
    mse_per_sequence = np.mean(np.square(X_upsampled - rec), axis=(1, 2))
    mse_total = np.mean(mse_per_sequence)
    score = max(0.0, min(10.0, 10.0 - (mse_total * 100.0)))
    
    mse_per_feature = np.mean(np.square(X_upsampled - rec), axis=(0, 1))
    joint_errors = [np.mean(mse_per_feature[idx*3:(idx+1)*3]) for idx in range(len(ORDERED_KEYS))]

    # Professional Success Header
    st.markdown(f"""
    <div style="background: linear-gradient(90deg, rgba(194,255,0,0.2) 0%, rgba(0,0,0,0) 100%); padding: 20px; border-left: 5px solid var(--primary); border-radius: 8px; margin: 25px 0;">
        <h3 style="margin: 0; color: var(--primary);">✅ Motion Verification Complete</h3>
        <p style="margin: 5px 0 0 0; color: #fff; opacity: 0.8; font-size: 1.1em;">Subject movement reconstructed against ATP performance benchmarks.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Redesigned Compact Dashboard
    res_tab1, res_tab2 = st.tabs(["📽 MOTION RECONSTRUCTION", "📊 PERFORMANCE ANALYTICS"])

    with res_tab1:
        # Widening the video column significantly to fulfill the request for larger video
        vid_col, info_col = st.columns([2, 1], gap="medium")
        with vid_col:
            st.markdown("##### 🎾 Neural Skeletal Tracking")
            if os.path.exists(annotated_video_path):
                st.video(annotated_video_path, autoplay=True)
        with info_col:
            st.markdown("##### 🚩 Technical Alerts")
            weak_points = sorted(set([WEAK_POINT_MESSAGES.get(ORDERED_KEYS[i], ORDERED_KEYS[i])
                                   for i, e in enumerate(joint_errors) if e > 0.035]))

            if weak_points:
                for wp in weak_points:
                    st.markdown(f"""
                    <div style="background:rgba(255,60,60,0.15); border:1px solid rgba(255,60,60,0.4);
                                border-left:4px solid #ff3c3c; border-radius:10px;
                                padding:12px 16px; margin-bottom:8px; font-size:0.95em; color:#fff;">
                        ⚠️ {wp}
                    </div>""", unsafe_allow_html=True)
            else:
                st.success("✨ **Pro-level consistency.** No significant technical deviations.")

            st.markdown("<br>", unsafe_allow_html=True)

            # Full-width score cards
            score_display = f"{score:.1f}/10"
            acc_display = f"{max(0, 100 - (mse_total*1000)):.1f}%"
            score_color = "#c2ff00" if score >= 7 else "#ffaa00" if score >= 5 else "#ff4b4b"
            st.markdown(f"""
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
                <div style="background:linear-gradient(135deg,rgba(30,33,48,0.9),rgba(18,20,30,0.95));
                            border:1px solid {score_color}44; border-top:3px solid {score_color};
                            border-radius:14px; padding:20px 16px; text-align:center;">
                    <div style="color:rgba(255,255,255,0.5); font-size:0.7rem; text-transform:uppercase;
                                letter-spacing:0.12em; margin-bottom:8px;">FORM SCORE</div>
                    <div style="color:{score_color}; font-size:2.2rem; font-weight:800;
                                font-family:'Outfit',sans-serif; line-height:1;">{score_display}</div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(30,33,48,0.9),rgba(18,20,30,0.95));
                            border:1px solid rgba(0,212,255,0.3); border-top:3px solid #00d4ff;
                            border-radius:14px; padding:20px 16px; text-align:center;">
                    <div style="color:rgba(255,255,255,0.5); font-size:0.7rem; text-transform:uppercase;
                                letter-spacing:0.12em; margin-bottom:8px;">ACCURACY</div>
                    <div style="color:#00d4ff; font-size:2.2rem; font-weight:800;
                                font-family:'Outfit',sans-serif; line-height:1;">{acc_display}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            with open(annotated_video_path, "rb") as f:
                st.download_button("📥 EXPORT ANALYSIS REPORT", f, "analysis_report.mp4", "video/mp4")

    with res_tab2:
        # Full-Width 16-Joint Technical Deviation Analysis
        st.markdown("#### 🎯 16-Point Technical Deviation Analysis")
        
        # Map errors to Graph Order
        graph_errors = [joint_errors[ORDERED_KEYS.index(k)] for k in GRAPH_ORDER]
        
        joint_fig = go.Figure(go.Bar(
            x=GRAPH_ORDER, 
            y=graph_errors, 
            marker_color=['#ff4b4b' if e > 0.035 else '#c2ff00' for e in graph_errors],
            text=[f"{e*100:.1f}%" for e in graph_errors],
            textposition='auto',
        ))
        
        joint_fig.update_layout(
            title="Skeletal Deviation Magnitude (Body-Wide Tracking)",
            template="plotly_dark",
            height=500,
            margin=dict(l=20, r=20, t=60, b=150),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            xaxis_tickangle=-45,
            yaxis_title="Deviation Magnitude",
            showlegend=False
        )
        st.plotly_chart(joint_fig)

        st.markdown("---")
        st.markdown("#### 📈 Kinetic Stability Flow (Real-time Analysis)")
        fig = go.Figure()
        fig.add_trace(go.Scatter(y=mse_per_sequence, mode='lines', name='Instability', 
                               line=dict(color='#c2ff00', width=3), fill='tozeroy',
                               fillcolor='rgba(194,255,0,0.1)'))
        fig.update_layout(title="Kinetic Stability Curve (Performance Smoothness)", template="plotly_dark", height=500,
                         paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                         xaxis_title="Motion Sequence (Time)", yaxis_title="Instability Magnitude")
        st.plotly_chart(fig)

    video_detector.close()

if __name__ == "__main__":
    main()
