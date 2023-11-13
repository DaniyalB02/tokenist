from collections import OrderedDict
import json
import networkx as nx

def convert_to_networkx(data):

    if isinstance(data, dict):
        data = json.dumps(data)   
    
    
    data = json.loads(data, object_pairs_hook=OrderedDict)

    nodes = data["data"]

    G = nx.Graph()

    for node in nodes:
        node_id = node["id"]
        node_balance = float(node["balance"])
        
        # Set color to red for all nodes
        node_color = 'red'
        
        G.add_node(node_id, balance=node_balance, color=node_color)
    
    return G