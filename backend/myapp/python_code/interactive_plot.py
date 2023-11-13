import hvplot.networkx as hvnx
import holoviews as hv
import networkx as nx

def interactive_plot(df):
  
  def multigraph_to_graph(M, edge_attr, scale=1.0):
        """
        Create a simple graph by summing
        over a given edge attribute
        """
        G = nx.Graph()
        G.add_nodes_from(M.nodes(data=True))
        for u, v, data in M.edges(data=True):
            
            if edge_attr in data:
                w = data[edge_attr] * scale
            else:
                w = 0.0
            
            if G.has_edge(u,v):
                if edge_attr in G[u][v]:
                    G[u][v][edge_attr] += w
                else:
                    G[u][v][edge_attr] = w
            else:
                G.add_edge(u, v, **{'edge_attr': w})

        return G

    # Generate a simple graph for the last state of the network
  G = multigraph_to_graph(df.agents_network.iloc[-1], 'amount',
                            scale=5e-4)

    # Let's visualize the edges amount
  options = {'with_labels': True,
            'edge_width': 'amount',
            'edge_color': '#f46d43',
            'node_size': 'balance'}

  viz = hvnx.draw(G, **options)
  return viz

