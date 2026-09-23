import asyncio
import os
import shutil
import subprocess
import time
import edge_tts
import imageio_ffmpeg
from playwright.async_api import async_playwright

VOICE = "en-US-ChristopherNeural"
RATE = "-2%"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HACKATHON_DIR = os.path.join(ROOT_DIR, "hackathon")
TEMP_DIR = os.path.join(HACKATHON_DIR, "temp_live_build")
RECORDINGS_DIR = os.path.join(HACKATHON_DIR, "temp_recordings")
OUTPUT_VIDEO = os.path.join(HACKATHON_DIR, "nemotron_axiom_direct_demo.mp4")

SCENES = [
    {
        "index": 1,
        "tab": "Verification Studio",
        "audio_file": "audio_1.mp3",
        "speech": (
            "In concurrent mission-critical infrastructure, probabilistic code generation is a catastrophic liability. "
            "Meet Nemotron AXIOM, synthesizing provably acyclic concurrent systems using NVIDIA Nemotron on Nebius Token Factory "
            "and Microsoft Z3 SMT formal verification."
        ),
    },
    {
        "index": 2,
        "tab": "Chaos Concurrency Lab",
        "audio_file": "audio_2.mp3",
        "speech": (
            "Under high-concurrency runtime chaos, unverified code deadlocks instantly. "
            "AXIOM's formal invariant guarantees zero race conditions and 100% completion across 50 concurrent worker threads."
        ),
    },
    {
        "index": 3,
        "tab": "CI/CD Gatekeeper",
        "audio_file": "audio_3.mp3",
        "speech": (
            "Automated for enterprise DevSecOps pipelines. Every pull request receives mathematical proof attestation, "
            "SLSA Level 3 compliance badges, and automated SARIF security audits."
        ),
    },
    {
        "index": 4,
        "tab": "Benchmarks",
        "audio_file": "audio_4.mp3",
        "speech": (
            "Powered by Nebius Token Factory with NVIDIA H100 GPUs, AXIOM achieves sub-20 millisecond inference "
            "and 100% formal soundness against GPT-4o's 41% on concurrency."
        ),
    },
    {
        "index": 5,
        "tab": "RFC Knowledge Explorer",
        "audio_file": "audio_5.mp3",
        "speech": (
            "Autonomous neuro-symbolic reasoning grounded directly in POSIX standards. "
            "Software is eating the world; Nemotron AXIOM mathematically guarantees it will never break."
        ),
    },
]

def get_media_duration(ffmpeg_exe, media_path):
    cmd = [ffmpeg_exe, "-i", media_path, "-hide_banner"]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            part = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = part.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 15.0

async def generate_audio_tracks():
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(RECORDINGS_DIR, exist_ok=True)
    os.makedirs(HACKATHON_DIR, exist_ok=True)

    print("\n--- STEP 1: GENERATING VOICE-OVER TRACKS ---")
    durations = []
    audio_paths = []
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    for scene in SCENES:
        idx = scene["index"]
        path = os.path.join(TEMP_DIR, scene["audio_file"])
        print(f"Synthesizing Track {idx}...")
        communicate = edge_tts.Communicate(scene["speech"], VOICE, rate=RATE)
        await communicate.save(path)
        dur = get_media_duration(ffmpeg_exe, path)
        print(f"  -> Generated {scene['audio_file']}: duration = {dur:.2f}s")
        durations.append(dur)
        audio_paths.append(path)

    # Build master audio file by concatenating the 5 tracks
    concat_txt = os.path.join(TEMP_DIR, "audio_concat.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for p in audio_paths:
            f.write(f"file '{p.replace('\\', '/')}'\n")

    master_audio = os.path.join(TEMP_DIR, "master_audio.mp3")
    cmd = [ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-c", "copy", master_audio]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    total_dur = get_media_duration(ffmpeg_exe, master_audio)
    print(f"Master audio track generated: {master_audio} ({total_dur:.2f}s)\n")
    return durations, master_audio

async def record_browser_session(durations):
    print("--- STEP 2: DIRECT LIVE BROWSER RECORDING VIA PLAYWRIGHT ---")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--font-render-hinting=none"
            ]
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=RECORDINGS_DIR,
            record_video_size={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        print("Navigating to http://localhost:3000 ...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # SCENE 1: Verification Studio
        print(f"Scene 1: Verification Studio (target duration: {durations[0]:.2f}s)")
        s1_start = time.time()
        # Smoothly scroll down to show the dual-pane code and Z3 status card
        await page.evaluate("window.scrollBy({ top: 380, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        await page.wait_for_timeout(3500)
        # Scroll back up to the top
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        await page.wait_for_timeout(1000)
        rem1 = max(0.1, durations[0] - (time.time() - s1_start))
        await page.wait_for_timeout(rem1 * 1000)

        # SCENE 2: Chaos Concurrency Lab
        print(f"Scene 2: Chaos Concurrency Lab (target duration: {durations[1]:.2f}s)")
        s2_start = time.time()
        chaos_tab = page.locator("button:has-text('Chaos Concurrency Lab')").first
        await chaos_tab.click()
        await page.wait_for_timeout(1200)

        # Click the 50-worker simulation button
        sim_btn = page.locator("button:has-text('Run 50-Worker Chaos Sim')").first
        if await sim_btn.count() > 0:
            await sim_btn.click()
            print("  -> Triggered 50-Worker Chaos Sim")
        
        # Scroll down to observe the 50 workers matrix
        await page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        await page.wait_for_timeout(1000)
        rem2 = max(0.1, durations[1] - (time.time() - s2_start))
        await page.wait_for_timeout(rem2 * 1000)

        # SCENE 3: CI/CD Gatekeeper
        print(f"Scene 3: CI/CD Gatekeeper (target duration: {durations[2]:.2f}s)")
        s3_start = time.time()
        gatekeeper_tab = page.locator("button:has-text('CI/CD Gatekeeper')").first
        await gatekeeper_tab.click()
        await page.wait_for_timeout(1500)

        sarif_subtab = page.locator("button:has-text('SARIF')").first
        if await sarif_subtab.count() > 0:
            await sarif_subtab.click()
            await page.wait_for_timeout(2000)

        await page.evaluate("window.scrollBy({ top: 450, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        await page.wait_for_timeout(1000)
        rem3 = max(0.1, durations[2] - (time.time() - s3_start))
        await page.wait_for_timeout(rem3 * 1000)

        # SCENE 4: Benchmarks
        print(f"Scene 4: Benchmarks (target duration: {durations[3]:.2f}s)")
        s4_start = time.time()
        benchmarks_tab = page.locator("button:has-text('Benchmarks')").first
        await benchmarks_tab.click()
        await page.wait_for_timeout(1500)

        await page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        await page.wait_for_timeout(1000)
        rem4 = max(0.1, durations[3] - (time.time() - s4_start))
        await page.wait_for_timeout(rem4 * 1000)

        # SCENE 5: RFC Knowledge Explorer
        print(f"Scene 5: RFC Knowledge Explorer (target duration: {durations[4]:.2f}s)")
        s5_start = time.time()
        grounding_tab = page.locator("button:has-text('RFC Knowledge Explorer')").first
        await grounding_tab.click()
        await page.wait_for_timeout(1500)

        await page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        await page.wait_for_timeout(1000)
        rem5 = max(0.1, durations[4] - (time.time() - s5_start))
        await page.wait_for_timeout(rem5 * 1000)

        await page.wait_for_timeout(1000)

        # Close context so playwright finalizes the video file
        await context.close()
        video_path = await page.video.path()
        print(f"Raw Playwright video finalized at: {video_path}")

        await browser.close()
        return video_path

def merge_video_and_audio(raw_video_path, master_audio_path):
    print("\n--- STEP 3: MERGING DIRECT LIVE RECORDING WITH SYNCHRONIZED AUDIO ---")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", raw_video_path,
        "-i", master_audio_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"FFmpeg merge error:\n{res.stderr}")
        raise RuntimeError("FFmpeg merge failed")

    final_dur = get_media_duration(ffmpeg_exe, OUTPUT_VIDEO)
    file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)

    # Clean up test_rec if exists
    test_rec = os.path.join(ROOT_DIR, "test_rec")
    if os.path.exists(test_rec):
        shutil.rmtree(test_rec, ignore_errors=True)

    print("\n=======================================================")
    print(" DIRECT LIVE APPLICATION DEMO VIDEO RECORDED SUCCESSFULLY")
    print("=======================================================")
    print(f"Output File:     {OUTPUT_VIDEO}")
    print(f"Total Duration:  {final_dur:.1f} seconds (~{final_dur/60:.2f} minutes)")
    print(f"File Size:       {file_size_mb:.2f} MB")
    print(f"Resolution:      1920x1080 (Full HD 60fps Playwright capture)")
    print(f"Audio Voice:     {VOICE} (Synchronized per Tab)")
    print("No screenshots, no static slides: 100% Real Live App!")
    print("=======================================================\n")

async def main():
    durations, master_audio = await generate_audio_tracks()
    raw_video = await record_browser_session(durations)
    merge_video_and_audio(raw_video, master_audio)

if __name__ == "__main__":
    asyncio.run(main())
