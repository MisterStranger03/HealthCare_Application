from app.graph.lang_graph import graph

def invoke(payload: dict) -> dict:
    return graph.invoke(payload)
