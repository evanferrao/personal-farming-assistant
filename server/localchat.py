from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI(title="Local LLaMA Chat")

model_id = "KissanAI/Dhenu2-In-Llama3.2-1B-Instruct"

print("[INFO] Loading model...")
tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
)
print("[INFO] Model loaded.")


class ChatRequest(BaseModel):
    messages: list[dict]  # [{sender: 'user'|'assistant', text: '...'}]


@app.post("/generate")
def generate(req: ChatRequest):
    messages = req.messages
    if not messages or not isinstance(messages, list):
        raise HTTPException(status_code=400, detail="messages array required")

    # Convert to chat template
    chat_input = tokenizer.apply_chat_template(
        [
            {
                "role": "user" if m["sender"] == "user" else "assistant",
                "content": m["text"],
            }
            for m in messages
        ],
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(chat_input, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=256, temperature=0.7, top_p=0.9)
    reply = tokenizer.decode(output[0], skip_special_tokens=True)
    return {"reply": reply}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5005)
