import networkx as nx
import matplotlib.pyplot as plt
import io

def draw_total_network(G, df, image_save_path=None):
    G = df.agents_network.iloc[-1]

    # Get the agent balances
    node_balances = nx.get_node_attributes(G, 'balance')
    node_labels = {node: f"{value :.0f}" for node, value in node_balances.items()}

    # Get the agent colors
    node_colors = nx.get_node_attributes(G, 'color')

    # Node sizes
    sizes = list(node_balances.values())

    # Prepare the figure with Agg backend
    plt.switch_backend('Agg')
    fig, ax = plt.subplots(figsize=(12, 4))

    # Draw the nodes
    pos = nx.spring_layout(G)
    node_colors_list = [node_colors.get(node, "blue") for node in G.nodes()]
    nx.draw(G,
            pos,
            node_size=sizes,
            node_color=node_colors_list, ax=ax)

    # Draw the balances
    nx.draw_networkx_labels(G, pos, labels=node_labels, ax=ax)

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
