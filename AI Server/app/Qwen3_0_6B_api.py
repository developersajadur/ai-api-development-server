import re
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()

limiter = Limiter(key_func=get_remote_address)

# Load Model From Local Directory
tokenizer = AutoTokenizer.from_pretrained("AI_Models/Qwen/Qwen3-0.6B")
model = AutoModelForCausalLM.from_pretrained(
    "AI_Models/Qwen/Qwen3-0.6B",
    dtype=torch.bfloat16,
    device_map="auto",
)

# System Prompt to guide the model directly to the answer
SYSTEM_PROMPT = (
    "You are a helpful, intelligent AI assistant. "
    "You understand English, Bengali (বাংলা), and Romanized Bengali (Banglish). "
    "Provide direct, helpful, and concise answers to the user without any internal monologue or <think> tags."
)

# Define Chat Request Schema
class ChatRequest(BaseModel):
    prompt: str
    enable_thinking: bool = False
    max_tokens: Optional[int] = 1024

# Chat Endpoint
@router.post("/chat")
@limiter.limit("3/5seconds")
async def chat(request: Request, req: ChatRequest):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.prompt},
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
        enable_thinking=req.enable_thinking,
    ).to(model.device)

    max_new_tokens = req.max_tokens or 1024

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
    )

    result = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[-1]:],
        skip_special_tokens=True,
    )

    clean_result = re.sub(
        r"<think>[\s\S]*?</think>",
        "",
        result,
    ).strip()

    if clean_result.startswith("<think>"):
        clean_result = clean_result.replace("<think>", "").strip()

    final_output = clean_result if clean_result else result

    return {"content": final_output}