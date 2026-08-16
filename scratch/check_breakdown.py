import httpx

client = httpx.Client(timeout=30)
res = client.get("http://127.0.0.1:8000/api/v1/analyses/8a9e0c6e-5057-4b7a-8aa8-d3ead1bfeaba")
data = res.json()
print("Keys:", list(data.keys()))
if "results_json" in data:
    print("Overall Score:", data["results_json"]["overall_score"])
