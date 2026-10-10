from huggingface_hub import snapshot_download

# Download AI Model From HuggingFace Model Hub
snapshot_download(
    repo_id="Qwen/Qwen3-0.6B",
    local_dir="./AI_Models/Qwen/Qwen3-0.6B",
    local_dir_use_symlinks=False,
)
