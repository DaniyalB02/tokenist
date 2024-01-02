import networkx as nx
import matplotlib.pyplot as plt
import io

def draw_networkx(G, df, image_save_path=None):
    # Get the last row of the DataFrame
    last_row = df.iloc[-1].values

    # Update the node balances in the graph
    for i, node in enumerate(G.nodes):
        G.nodes[node]["balance"] = last_row[i]

    # Get the node balances
    node_balances = nx.get_node_attributes(G, 'balance')
    node_labels = {node: f"{value :.0f}" for node, value in node_balances.items()}

    # Get the node colors
    node_colors = nx.get_node_attributes(G, 'color')

    # Get the edge probabilities
    edge_probabilities = nx.get_edge_attributes(G, 'probability')
    edge_labels = {(start, end): f"{value:.2f}" for (start, end), value in edge_probabilities.items()}

    # Prepare the figure with Agg backend
    plt.switch_backend('Agg')
    fig, ax = plt.subplots(figsize=(12, 4))

    # Draw the nodes using circular layout
    pos = nx.circular_layout(G)
    node_colors_list = [node_colors.get(node, "blue") for node in G.nodes()]

    # Use a constant value for node_size
    constant_node_size = 100
    nx.draw(G,
            pos,
            node_size=constant_node_size,
            node_color=node_colors_list,
            ax=ax)

    # Draw the node balances
    nx.draw_networkx_labels(G, pos, labels=node_labels, ax=ax)

    # Draw the directed edges with arrows
    nx.draw_networkx_edges(G, pos, ax=ax, edge_color='black', width=1.0, arrows=True, arrowsize=20)

    # Draw the edge labels
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, ax=ax)

    # Save the plot as an image if an image save path is provided
    if image_save_path:
        plt.savefig(image_save_path, format='png')
        plt.close(fig)
        return image_save_path

    # If no image save path is provided, return the image as bytes
    else:
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plt.close(fig)
        return buf.getvalue()
