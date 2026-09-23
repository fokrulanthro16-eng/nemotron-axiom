import asyncio
import os
import subprocess
import edge_tts
import imageio_ffmpeg

VOICE = "en-US-ChristopherNeural"
RATE = "-2%"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(ROOT_DIR, "docs", "assets")
HACKATHON_DIR = os.path.join(ROOT_DIR, "hackathon")
TEMP_DIR = os.path.join(HACKATHON_DIR, "temp_video_build")
OUTPUT_VIDEO = os.path.join(HACKATHON_DIR, "nemotron_axiom_presentation.mp4")

SLIDES = [
    {
        "index": 1,
        "image": os.path.join(ASSETS_DIR, "screenshot_1_verification_studio.png"),
        "speech": (
            "In concurrent mission-critical systems, probabilistic AI code generation is an unacceptable liability. "
            "LLMs hallucinate subtle race conditions and catastrophic deadlocks. "
            "Meet Nemotron AXIOM, combining NVIDIA Nemotron-70B on Nebius Token Factory with Microsoft Z3 SMT theorem "
            "proving to mathematically guarantee provably correct code synthesis."
        ),
    },
    {
        "index": 2,
        "image": os.path.join(ASSETS_DIR, "screenshot_2_chaos_concurrency_50_workers.png"),
        "speech": (
            "We don't just prove correctness symbolically; we prove it under runtime chaos. "
            "Across our 50-worker stress harness, legacy unverified implementations freeze at thread 14 under circular deadlock. "
            "AXIOM verified code completes 50 out of 50 threads in 14 milliseconds with zero contention."
        ),
    },
    {
        "index": 3,
        "image": os.path.join(ASSETS_DIR, "screenshot_3_cicd_gatekeeper_sarif.png"),
        "speech": (
            "For modern engineering organizations, AXIOM functions as an autonomous GitHub PR Gatekeeper. "
            "Every merge is verified via Counterexample-Guided Inductive Synthesis, generating SLSA Level 3 attestations "
            "and OASIS SARIF 2.1 compliance audits."
        ),
    },
    {
        "index": 4,
        "image": os.path.join(ASSETS_DIR, "screenshot_4_benchmarks_h100.png"),
        "speech": (
            "Deployed on Nebius Token Factory with NVIDIA H100 SXM5 GPUs, AXIOM delivers sub-20 millisecond "
            "time-to-first-token inference. Empirical benchmarks demonstrate 100% formal soundness against "
            "GPT-4o's 41% on complex concurrency."
        ),
    },
    {
        "index": 5,
        "image": os.path.join(ASSETS_DIR, "screenshot_5_rfc_grounding.png"),
        "speech": (
            "Our agent loop grounds directly into official POSIX and language RFCs via Tavily before translating "
            "invariants into Z3 first-order logic. Software is eating the world; Nemotron AXIOM ensures its mathematical "
            "foundation never breaks."
        ),
    },
]

def get_media_duration(ffmpeg_exe, media_path):
    cmd = [
        ffmpeg_exe,
        "-i", media_path,
        "-hide_banner"
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            part = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = part.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 20.0

async def generate_speech():
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(HACKATHON_DIR, exist_ok=True)
    
    audio_paths = []
    print("\n--- STEP 1: NEURAL TTS SYNTHESIS ---")
    for slide in SLIDES:
        idx = slide["index"]
        audio_file = os.path.join(TEMP_DIR, f"voiceover_{idx}.mp3")
        print(f"Synthesizing voiceover for Slide {idx} using {VOICE}...")
        communicate = edge_tts.Communicate(slide["speech"], VOICE, rate=RATE)
        await communicate.save(audio_file)
        audio_paths.append(audio_file)
        print(f"  -> Generated: {audio_file}")
    return audio_paths

def render_presentation():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"\nUsing FFMPEG binary: {ffmpeg_exe}")

    audio_paths = asyncio.run(generate_speech())

    print("\n--- STEP 2: VIDEO SEGMENT GENERATION ---")
    clip_files = []
    for i, slide in enumerate(SLIDES):
        idx = slide["index"]
        img_path = slide["image"]
        audio_path = audio_paths[i]
        raw_dur = get_media_duration(ffmpeg_exe, audio_path)
        clip_output = os.path.join(TEMP_DIR, f"clip_{idx}.mp4")

        print(f"Creating Slide {idx} clip: audio duration={raw_dur:.2f}s...")
        # Add 0.8s padding of silence at end for clean transition
        cmd = [
            ffmpeg_exe,
            "-y",
            "-loop", "1",
            "-i", img_path,
            "-i", audio_path,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-af", "apad=pad_dur=0.8",
            "-pix_fmt", "yuv420p",
            "-vf", "scale=1920:1080",
            "-shortest",
            clip_output
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"Error rendering clip {idx}:\n{res.stderr}")
            raise RuntimeError(f"FFmpeg failed on clip {idx}")
        clip_files.append(clip_output)
        print(f"  -> Rendered clip: {clip_output}")

    print("\n--- STEP 3: CONCATENATING FULL PRESENTATION VIDEO ---")
    concat_list_path = os.path.join(TEMP_DIR, "concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for clip in clip_files:
            clean_path = clip.replace("\\", "/")
            f.write(f"file '{clean_path}'\n")

    concat_cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        OUTPUT_VIDEO
    ]
    res = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error concatenating clips:\n{res.stderr}")
        raise RuntimeError("FFmpeg concat failed")

    # Clean up test probe files if any
    for fname in os.listdir(ROOT_DIR):
        if fname.startswith("slide_") and fname.endswith(".mp3"):
            try:
                os.remove(os.path.join(ROOT_DIR, fname))
            except Exception:
                pass

    final_duration = get_media_duration(ffmpeg_exe, OUTPUT_VIDEO)
    file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)

    print("\n=======================================================")
    print(" PRESENTATION VIDEO GENERATION COMPLETE")
    print("=======================================================")
    print(f"Output File:     {OUTPUT_VIDEO}")
    print(f"Total Duration:  {final_duration:.1f} seconds (~{final_duration/60:.2f} minutes)")
    print(f"File Size:       {file_size_mb:.2f} MB")
    print(f"Resolution:      1920x1080 (Full HD)")
    print(f"Audio Voice:     {VOICE} (Neural)")
    print("Ready for Devpost / YouTube / Investor demo submission!")
    print("=======================================================\n")

if __name__ == "__main__":
    render_presentation()
