import json
from collections import OrderedDict
import networkx as nx

def convert_to_networkx(data):
    try:
        if isinstance(data, dict):
            data = json.dumps(data)

        data = json.loads(data, object_pairs_hook=OrderedDict)

        circles = data.get("circles", [])
        edges = data.get("edges", [])

        G = nx.DiGraph()  # Use DiGraph to create a directed graph

        # Add nodes with circle data
        for circle in circles:
            node_id = circle["id"]
            node_balance = float(circle["balance"])
            node_color = 'red'  # Set color to red for all nodes

            G.add_node(node_id, balance=node_balance, color=node_color)

        # Add edges with probability data
        for edge in edges:
            start_node = edge["start"]
            end_node = edge["end"]
            probability = float(edge["probability"])

            G.add_edge(start_node, end_node, probability=probability)

        return G

    except Exception as e:
        print(f"Error converting data to networkx: {str(e)}")
        return None
