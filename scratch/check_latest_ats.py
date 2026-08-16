import httpx

client = httpx.Client(timeout=30)
res = client.get("http://127.0.0.1:8000/api/v1/analyses/f0ad7d4a-77b5-4cf5-adf3-283ef8821acb")
data = res.json()
print("Data keys:", list(data.keys()))
results = data.get("results") or data.get("results_json")
if results:
    print("ATS Score:", results["ats"]["score"])
    print("ATS Pass:", results["ats"]["pass"])
    print("Parsing Accuracy:", results["ats"]["parsing_accuracy"])
    print("Found Keywords:", results["ats"]["found_keywords"])
    print("Missing Keywords:", results["ats"]["missing_keywords"])
