PROCESS_PROMPT = """
You are a senior enterprise architect.

Given a value chain stage, generate 4-8 business processes.

Requirements:
- Return only real enterprise business processes.
- Do not generate activities.
- Do not generate AI opportunities.
- Return ONLY valid JSON.

Example:

{
    "stage_name":"Supply Chain & Logistics",
    "processes":[
        {
            "name":"Demand Forecasting",
            "description":"Forecast future inventory demand."
        }
    ]
}
"""