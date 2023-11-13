
# cadCAD standard dependencies
# cadCAD configuration modules
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment

# cadCAD simulation engine modules
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.engine import Executor

# cadCAD global simulation configuration list
from cadCAD import configs

# Included with cadCAD
import pandas as pd

# Additional dependencies

# For networks
import networkx as nx

# For analytics
import numpy as np

# For visualization
from matplotlib import pyplot as plt

def cadCAD_model(G, interaction_prob, balance_fraction):

    initial_state = {
        'agents_network': G
    }

    system_params = {
        # Pair-wise interaction probability
        'interaction_probability': [interaction_prob], 
        
        # Fraction of the agent balance to stake
        'balance_fraction_to_stake': [balance_fraction] 
    }

    def p_interact(params, substep, state_history, previous_state):
        """
        Control agent interactions.
        """
        
        # Parameters
        interaction_probability = params['interaction_probability']
        balance_fraction_to_transfer = params['balance_fraction_to_stake']
        
        # State Variables
        G = previous_state['agents_network']

        # List of agent transactions
        transactions = []
        
        for agent_1 in G.nodes:
            for agent_2 in G.nodes:
                
                # Skip self-transactions
                if agent_1 == agent_2:
                    continue
                else:
                    # Determine if the agents are going to interact
                    will_interact = (np.random.rand() < interaction_probability)
                    
                    if will_interact is True:
                        # Get agent balances
                        agent_1_balance = G.nodes[agent_1]['balance']
                        agent_2_balance = G.nodes[agent_2]['balance']
                        
                        # Get exchange values
                        agent_1_exchange = agent_1_balance * balance_fraction_to_transfer
                        agent_2_exchange = agent_2_balance * balance_fraction_to_transfer
                        
                        # Set the final exchange as being the minimum of the two                
                        exchange = min(agent_1_exchange, agent_2_exchange)
                        
                        # Generate a transaction
                        transaction = {'source': agent_1,
                                    'destination': agent_2,
                                    'value': exchange}
                        
                        transactions.append(transaction)
                    else:
                        continue
                        
        # Return agent interactions
        return {'transactions': transactions}

    def s_agents_network(params, substep, state_history, previous_state, policy_input):
        # State Variables
        G_new = previous_state['agents_network'].copy()
        
        # Policy Inputs
        transactions = policy_input['transactions']
        
        for transaction in transactions:
            # Retrieve transaction details
            source = transaction['source']
            destination = transaction['destination']
            amount = transaction['value']
            
            # Add / remove the amount from the agent's balance
            G_new.nodes[source]['balance'] -= amount
            G_new.nodes[destination]['balance'] += amount
            
            # Add the transaction as a graph edge
            G_new.add_edge(source, destination, amount=amount)
            
        return ('agents_network', G_new)

    partial_state_update_blocks = [
        {   
            # Configure the model Policy Functions
            'policies': {
                'p_interact': p_interact
            },
            # Configure the model State Update Functions
            'variables': {
                'agents_network': s_agents_network
            }
        }
    ]

    sim_config = config_sim({
        "N": 1, # the number of times we'll run the simulation ("Monte Carlo runs")
        "T": range(300), # the number of timesteps the simulation will run for
        "M": system_params # the parameters of the system
    })

    del configs[:] # Clear any prior configs

    experiment = Experiment()
    experiment.append_configs(
        initial_state = initial_state,
        partial_state_update_blocks = partial_state_update_blocks,
        sim_configs = sim_config
    )

    exec_context = ExecutionContext()
    simulation = Executor(exec_context=exec_context, configs=experiment.configs)
    raw_result, tensor_field, sessions = simulation.execute()

    # Convert raw results to a Pandas DataFrame
    df = pd.DataFrame(raw_result)

    # Insert cadCAD parameters for each configuration into DataFrame
    for config in configs:
        # Get parameters from configuration
        parameters = config.sim_config['M']
        # Get subset index from configuration
        subset_index = config.subset_id
        
        # For each parameter key value pair
        for (key, value) in parameters.items():
            # Select all DataFrame indices where subset == subset_index
            dataframe_indices = df.eval(f'subset == {subset_index}')
            # Assign each parameter key value pair to the DataFrame for the corresponding subset
            df.loc[dataframe_indices, key] = value

    # Get the agents network at the beginning
    G = df.agents_network.iloc[0]

    # Get the agent balances
    node_balances = nx.get_node_attributes(G, 'balance')
    node_labels = {node: f"{value :.0f}" for node, value in node_balances.items()}

    # Get the agent colors
    node_colors = nx.get_node_attributes(G, 'color')

    # Node sizes
    sizes = list(node_balances.values())

    # Prepare the figure
    #plt.figure(figsize=(12, 4))

    # Draw the nodes
    """pos = nx.spring_layout(G)
    node_colors_list = [node_colors.get(node, "blue") for node in G.nodes()]
    nx.draw(G,
            pos,
            node_size=sizes,
            node_color=node_colors_list)
"""

    # Draw the balances
    #nx.draw_networkx_labels(G, pos, labels=node_labels)
    
    # Get the agents network after 2 rounds
    G = df.agents_network.iloc[2]

    # Get the agent balances
    node_balances = nx.get_node_attributes(G, 'balance')
    node_labels = {node: f"{value :.0f}" for node, value in node_balances.items()}

    # Get the agent colors
    node_colors = nx.get_node_attributes(G, 'color')

    # Node sizes
    sizes = list(node_balances.values())


    # Prepare the figure
    plt.figure(figsize=(12, 4))

    # Draw the nodes
    pos = nx.spring_layout(G)
    node_colors_list = [node_colors.get(node, "blue") for node in G.nodes()]
    nx.draw(G,
            pos,
            node_size=sizes,
            node_color=node_colors_list)

    # Draw the balances
    nx.draw_networkx_labels(G, pos, labels=node_labels)
    
    return df