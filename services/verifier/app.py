from fastapi import FastAPI
from pydantic import BaseModel

from verifier import verify

app = FastAPI(title="EML Verifier")


class VerifyRequest(BaseModel):
    tree: dict
    targetFunction: str


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/verify")
def verify_route(req: VerifyRequest):
    return verify(req.tree, req.targetFunction)

