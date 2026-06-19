# EML Verifier Service

Run:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

Health check:

```txt
http://localhost:8001/health
```

Verify example:

```json
{
  "tree": {
    "type": "eml",
    "left": { "type": "const", "value": 1 },
    "right": { "type": "const", "value": 1 }
  },
  "targetFunction": "e"
}
```

