
# Included with cadCAD
import pandas as pd

# For analytics
import numpy as np


def markov_chain_simulation(G, num_steps):
    # Get the number of nodes in the graph
    num_nodes = len(G.nodes)

    # Initialize the initial state vector with node balances
    initial_state_vector = np.array([G.nodes[node]["balance"] for node in G.nodes])

    # Initialize the transition probability matrix with zeros
    transition_matrix = np.zeros((num_nodes, num_nodes))

    # Populate the transition probability matrix
    for start_node, end_node, data in G.edges(data=True):
        probability = data.get("probability", 0)
        transition_matrix[start_node - 1, end_node - 1] = probability  # Adjust indexing here

    print("Initial state vector:", initial_state_vector)
    print("Transition probability matrix:", transition_matrix)

    # Create a DataFrame with column names based on node IDs
    df = pd.DataFrame(columns=[f'Node_{i}' for i in range(1, num_nodes + 1)])

    # Use a list to efficiently collect rows
    rows_list = []

    # Simulate transactions for each step
    for step in range(num_steps):
        # Initialize a row with initial balances
        row = initial_state_vector.copy()

        # Simulate transactions between nodes
        for i in range(num_nodes):
            for j in range(num_nodes):
                # Check if a transaction occurs based on the transition probability matrix
                if np.random.rand() < transition_matrix[i, j]:
                    # Perform the transaction (e.g., 10% transfer)
                    transaction_amount = 0.1 * row[i]
                    row[i] -= transaction_amount
                    row[j] += transaction_amount

        # Append the row to the list
        rows_list.append(row)

    # Convert the list to a DataFrame
    df_extended = pd.DataFrame(rows_list, columns=df.columns)

    # Concatenate the original and extended DataFrames
    df = pd.concat([df, df_extended], ignore_index=True)

    return df