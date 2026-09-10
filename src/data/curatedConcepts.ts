import { ConceptChallenge } from '../types';

export interface DomainTrackInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  imageUrl?: string;
}

export const DOMAIN_TRACKS: DomainTrackInfo[] = [
  {
    id: 'Tech, AI & Cryptography',
    name: 'Tech, AI & Cryptography',
    shortName: 'Tech & AI',
    description: 'Public-key padlocks, transformer neural nets, distributed consensus, and computer architectures.',
    badgeColor: '#2563EB',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Science, Physics & Space',
    name: 'Science, Physics & Space',
    shortName: 'Science & Physics',
    description: 'Newtonian mechanics, cosmic redshifts, quantum states, and relativistic spacetime.',
    badgeColor: '#D97706',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Biology, Medicine & Neuroscience',
    name: 'Biology, Medicine & Neuroscience',
    shortName: 'Biology & Medicine',
    description: 'Photosynthetic energy, mRNA immune memory, neural action potentials, and gene editing.',
    badgeColor: '#059669',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Economics, Markets & Human Systems',
    name: 'Economics, Markets & Human Systems',
    shortName: 'Economics & Markets',
    description: 'Supply-demand equilibrium, exponential compounding, banking liquidity, and game theory.',
    badgeColor: '#7C3AED',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Philosophy, Logic & First Principles',
    name: 'Philosophy, Logic & First Principles',
    shortName: 'Philosophy & Logic',
    description: 'Bayesian probability updating, the hard problem of consciousness, and Occam’s razor.',
    badgeColor: '#475569',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  },
];

export const CURATED_CONCEPTS: ConceptChallenge[] = [
  // ==========================================
  // TRACK: TECH, AI & CRYPTOGRAPHY
  // ==========================================
  {
    id: 'public-key-crypto',
    title: 'Public Key Cryptography',
    domain: 'Tech, AI & Cryptography',
    stage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'How two strangers securely share secrets across an open internet full of eavesdroppers without meeting first.',
    studentPriors: 'I know what a physical padlock is, and I know computers transmit bits. But if an eavesdropper copies every packet, how can we agree on a secret without them seeing it?',
    starterPrompt: 'If an eavesdropper listens to every single word we transmit across the internet, how can we ever exchange private secrets without meeting in person first?',
    keyCausalComponents: [
      'Public key can be broadcast openly so anyone can snap the padlock shut',
      'One-way mathematical asymmetry (trapdoor function) makes reversing the lock computationally impossible without the private key',
      'Private key is kept strictly offline and is the sole inverse that unlocks the container',
    ],
    nodes: [
      { id: 'public_key', label: 'Open Public Key', shortDescription: 'An open padlock anyone in the world can copy and snap shut' },
      { id: 'asymmetric_encryption', label: 'One-Way Trapdoor Math', shortDescription: 'Easy to compute in forward direction, impossible to reverse without the secret' },
      { id: 'private_key', label: 'Secret Private Key', shortDescription: 'Held strictly offline; uniquely opens the mathematical padlock' },
    ],
    edges: [
      {
        id: 'edge_pub_to_enc',
        fromNodeId: 'public_key',
        toNodeId: 'asymmetric_encryption',
        requiredMechanism: 'The public key is shared across the open internet so any sender can use it to scramble messages with a one-way mathematical function.',
      },
      {
        id: 'edge_enc_to_priv',
        fromNodeId: 'asymmetric_encryption',
        toNodeId: 'private_key',
        requiredMechanism: 'Mathematical asymmetry dictates that reversing the trapdoor is impossible without the mathematical inverse held only in the private key.',
      },
    ],
  },
  {
    id: 'transformer-llm-attention',
    title: 'How Transformer LLMs Predict Tokens',
    domain: 'Tech, AI & Cryptography',
    stage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    description: 'How neural networks use self-attention to weigh word relationships across long distances to generate human-like prose.',
    studentPriors: 'I thought AI chatbots stored pre-written responses or memorized answers. How does a computer actually decide which word comes next in a new sentence?',
    starterPrompt: 'When an AI model generates a paragraph, how does it mathematically decide what the next token should be without memorizing canned answers?',
    keyCausalComponents: [
      'Tokens are embedded into high-dimensional vector space reflecting semantic meaning',
      'Self-attention calculates dot-product similarity to weigh relationships between all tokens in the context',
      'Softmax probability distribution predicts the single most contextually coherent next token',
    ],
    nodes: [
      { id: 'vector_embeddings', label: 'High-Dimensional Embeddings', shortDescription: 'Words converted into geometric coordinates reflecting conceptual meaning' },
      { id: 'self_attention_heads', label: 'Self-Attention Weights', shortDescription: 'Dot-product queries and keys measure how tokens in the sentence relate to each other' },
      { id: 'softmax_distribution', label: 'Next-Token Probability (Softmax)', shortDescription: 'Calculates probability distribution to sample the next coherent token' },
    ],
    edges: [
      {
        id: 'edge_embed_to_att',
        fromNodeId: 'vector_embeddings',
        toNodeId: 'self_attention_heads',
        requiredMechanism: 'Vector coordinates allow the attention heads to compare dot products between queries and keys to calculate relational weights.',
      },
      {
        id: 'edge_att_to_soft',
        fromNodeId: 'self_attention_heads',
        toNodeId: 'softmax_distribution',
        requiredMechanism: 'Contextually weighted representations pass through final feedforward layers into a softmax function yielding next-token odds.',
      },
    ],
  },
  {
    id: 'blockchain-consensus-hashing',
    title: 'Distributed Consensus & Cryptographic Hashing',
    domain: 'Tech, AI & Cryptography',
    stage: 3,
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    description: 'How thousands of untrusted computers agree on an immutable ledger of transactions without trusting a central bank.',
    studentPriors: 'I understand databases store records, but if anyone can participate in a network, why can’t a rogue computer falsify previous balances?',
    starterPrompt: 'In a decentralized network with no central server, what mathematically prevents a malicious node from rewriting past ledger transactions?',
    keyCausalComponents: [
      'Cryptographic hash functions generate an irreversible fingerprint for each block',
      'Each block header cryptographically incorporates the exact hash of the preceding block',
      'Altering any past transaction cascades invalid hashes down the entire chain requiring impossible computational work to replace',
    ],
    nodes: [
      { id: 'one_way_hash', label: 'Cryptographic Hash Function', shortDescription: 'Deterministic one-way algorithm producing fixed-length block fingerprint' },
      { id: 'chained_headers', label: 'Chained Block Headers', shortDescription: 'Every new block incorporates the previous block’s fingerprint' },
      { id: 'immutable_ledger', label: 'Proof-of-Work Consensus', shortDescription: 'Altering historical records invalidates all subsequent blocks across the network' },
    ],
    edges: [
      {
        id: 'edge_hash_to_chain',
        fromNodeId: 'one_way_hash',
        toNodeId: 'chained_headers',
        requiredMechanism: 'The cryptographic hash of block N is embedded into the header of block N+1, welding the sequence together.',
      },
      {
        id: 'edge_chain_to_ledger',
        fromNodeId: 'chained_headers',
        toNodeId: 'immutable_ledger',
        requiredMechanism: 'Modifying a single bit in an old block changes its hash, breaking the entire cryptographic chain and causing honest nodes to reject it.',
      },
    ],
  },

  // ==========================================
  // TRACK: SCIENCE, PHYSICS & SPACE
  // ==========================================
  {
    id: 'newtons-third-law-rockets',
    title: "Newton's Third Law & Rocket Propulsion",
    domain: 'Science, Physics & Space',
    stage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1517976487502-5743b17c9135?auto=format&fit=crop&w=800&q=80',
    description: 'Why a spacecraft accelerates through the hard vacuum of deep space when there is literally no air or ground to push against.',
    studentPriors: 'I know when I jump my feet push off the ground. But in empty outer space there is total vacuum. What does a rocket push against?',
    starterPrompt: 'In the total vacuum of deep space, there is no air and no ground. What does a rocket engine push against to accelerate forward?',
    keyCausalComponents: [
      'Combustion chambers exert massive internal pressure in all directions, expelling mass at ultra-high velocity out the open nozzle',
      'Conservation of momentum: The ejected exhaust mass carries away negative backward momentum',
      'Equal and opposite reaction: The rocket body must gain forward momentum to conserve total system momentum',
    ],
    nodes: [
      { id: 'combustion_ejection', label: 'High-Velocity Mass Expulsion', shortDescription: 'Expanding gas mass forced backward through nozzle' },
      { id: 'momentum_conservation', label: 'Conservation of Momentum', shortDescription: 'Total momentum of the closed rocket-plus-exhaust system must equal zero' },
      { id: 'forward_acceleration', label: 'Forward Thrust Reaction', shortDescription: 'The rocket structure accelerates forward without needing external air' },
    ],
    edges: [
      {
        id: 'edge_eject_to_momentum',
        fromNodeId: 'combustion_ejection',
        toNodeId: 'momentum_conservation',
        requiredMechanism: 'Expelling hot propellant particles at thousands of meters per second assigns significant negative momentum to the exhaust gas.',
      },
      {
        id: 'edge_momentum_to_thrust',
        fromNodeId: 'momentum_conservation',
        toNodeId: 'forward_acceleration',
        requiredMechanism: 'Because total momentum must remain conserved, an equal forward momentum is imparted directly onto the rocket hull.',
      },
    ],
  },
  {
    id: 'doppler-effect-astronomy',
    title: 'The Doppler Effect & The Expanding Cosmos',
    domain: 'Science, Physics & Space',
    stage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'Why moving sirens change pitch, and how that simple wave compression proved the entire universe is expanding away from us.',
    studentPriors: 'I notice ambulance sirens sound higher when driving toward me and deeper when driving away. But how does that prove galaxies are flying apart?',
    starterPrompt: 'How does the pitch change of a passing emergency siren explain Edwin Hubble\'s discovery that distant galaxies are speeding away from us?',
    keyCausalComponents: [
      'Wavelength compression: Moving emitters bunch up waves ahead of them and stretch waves behind them',
      'Light as an electromagnetic wave: Compressed visible light shifts toward higher-frequency blue; stretched light shifts toward lower-frequency red',
      'Cosmological redshift: Distant galaxies show stretched spectral lines, proving space itself is stretching and receding',
    ],
    nodes: [
      { id: 'wave_compression', label: 'Wave Compression & Stretching', shortDescription: 'Velocity shifts the observed spacing between successive wave crests' },
      { id: 'spectral_redshift', label: 'Optical Frequency Shift (Redshift)', shortDescription: 'Receding light sources stretch toward longer, redder wavelengths' },
      { id: 'expanding_universe', label: 'Cosmological Metric Expansion', shortDescription: 'Universal redshifting across deep sky proves space itself is expanding' },
    ],
    edges: [
      {
        id: 'edge_wave_to_shift',
        fromNodeId: 'wave_compression',
        toNodeId: 'spectral_redshift',
        requiredMechanism: 'Because the speed of light is constant, when an emitter recedes, successive wave crests arrive farther apart, shifting spectral lines toward red.',
      },
      {
        id: 'edge_shift_to_expansion',
        fromNodeId: 'spectral_redshift',
        toNodeId: 'expanding_universe',
        requiredMechanism: 'Observing that virtually all distant galactic spectra are redshifted proportionally to distance revealed that the fabric of the universe is expanding.',
      },
    ],
  },
  {
    id: 'quantum-superposition-collapse',
    title: 'Quantum Superposition & Wavefunction Collapse',
    domain: 'Science, Physics & Space',
    stage: 3,
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
    description: 'How subatomic particles exist simultaneously in multiple probability states until physical measurement forces a definite reality.',
    studentPriors: 'I thought particles were tiny ball bearings with definite positions. Why do physicists say an electron is in multiple places until you look at it?',
    starterPrompt: 'Why does measuring a quantum particle force it to choose a single state, if it was spread out as a wave of possibilities right before?',
    keyCausalComponents: [
      'Schrödinger wavefunction mathematically describes all possible states as complex probability amplitudes',
      'Quantum superposition: Amplitudes interfere constructively and destructively like physical water waves',
      'Measurement interaction entangles the system with the macro environment, causing decoherence and collapse to one eigenvalue',
    ],
    nodes: [
      { id: 'probability_amplitudes', label: 'Wavefunction Superposition', shortDescription: 'Complex probability waves containing all possible measurement outcomes' },
      { id: 'interference_patterns', label: 'Quantum Interference', shortDescription: 'Probability waves self-interfere to enhance or cancel out outcome probabilities' },
      { id: 'measurement_decoherence', label: 'Environmental Decoherence', shortDescription: 'Macroscopic measurement interaction forces collapse to a single observable state' },
    ],
    edges: [
      {
        id: 'edge_amp_to_interfere',
        fromNodeId: 'probability_amplitudes',
        toNodeId: 'interference_patterns',
        requiredMechanism: 'Multiple superposed state pathways interfere with each other according to the Schrödinger equation.',
      },
      {
        id: 'edge_interfere_to_collapse',
        fromNodeId: 'interference_patterns',
        toNodeId: 'measurement_decoherence',
        requiredMechanism: 'Thermodynamic interaction with a measurement apparatus breaks phase coherence, yielding one concrete deterministic measurement.',
      },
    ],
  },

  // ==========================================
  // TRACK: BIOLOGY, MEDICINE & NEUROSCIENCE
  // ==========================================
  {
    id: 'photosynthesis-cellular-energy',
    title: 'Photosynthesis & Solar Energy',
    domain: 'Biology, Medicine & Neuroscience',
    stage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    description: 'How green chloroplasts convert sunlight, water, and ambient carbon dioxide into chemical sugars and breathable oxygen.',
    studentPriors: 'I know plants drink water and need sun, but how do inanimate photons and gas turn into physical solid wood, leaves, and sugar?',
    starterPrompt: 'I know plants need sunlight and water, but how do photons of light actually turn into physical carbohydrates and oxygen inside a leaf?',
    keyCausalComponents: [
      'Light reactions: Chlorophyll pigments absorb solar photons to split water (H2O), producing oxygen gas and energetic ATP/NADPH',
      'Dark reactions (Calvin Cycle): Enzymes fix carbon dioxide (CO2) from the air using that stored chemical energy',
      'Bond formation: Inorganic carbon atoms are covalently synthesized into high-energy glucose sugar molecules',
    ],
    nodes: [
      { id: 'photon_absorption', label: 'Light Capture & Water Splitting', shortDescription: 'Photons excite chlorophyll electrons to cleave H2O, venting O2' },
      { id: 'chemical_carrier', label: 'Energy Carriers (ATP/NADPH)', shortDescription: 'Temporary energetic chemical batteries storing solar voltage' },
      { id: 'glucose_synthesis', label: 'Carbon Fixation (Glucose)', shortDescription: 'Enzymes bind ambient CO2 into dense solid sugar molecules' },
    ],
    edges: [
      {
        id: 'edge_photon_to_carrier',
        fromNodeId: 'photon_absorption',
        toNodeId: 'chemical_carrier',
        requiredMechanism: 'Excited electrons from chlorophyll split water molecules, generating protons that charge temporary chemical energy carriers.',
      },
      {
        id: 'edge_carrier_to_glucose',
        fromNodeId: 'chemical_carrier',
        toNodeId: 'glucose_synthesis',
        requiredMechanism: 'The chemical energy powers the Calvin cycle to covalently weld gaseous carbon dioxide molecules into physical glucose.',
      },
    ],
  },
  {
    id: 'mrna-vaccines-adaptive-immunity',
    title: 'mRNA Vaccines & Immune Training',
    domain: 'Biology, Medicine & Neuroscience',
    stage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    description: 'How a transient synthetic genetic strand teaches your immune cells to recognize and destroy viruses without ever exposing you to a live pathogen.',
    studentPriors: 'I thought vaccines contained weakened germs. How does a simple piece of temporary messenger RNA train antibodies to fight a real virus?',
    starterPrompt: 'How does an mRNA injection teach human cells to manufacture harmless viral proteins and generate lasting antibody defense?',
    keyCausalComponents: [
      'Lipid nanoparticles deliver synthetic mRNA instructions safely across human cell membranes',
      'Host cellular ribosomes translate the mRNA code to manufacture harmless viral spike proteins',
      'Immune B-cells and T-cells recognize the foreign spike, manufacturing specific antibodies and lasting memory cells',
    ],
    nodes: [
      { id: 'lipid_mrna_delivery', label: 'Lipid Nanoparticle Delivery', shortDescription: 'Protective lipid envelope delivers mRNA strand directly into cellular cytoplasm' },
      { id: 'ribosomal_translation', label: 'Spike Protein Translation', shortDescription: 'Cell ribosomes read mRNA codons to construct inert viral spike proteins' },
      { id: 'adaptive_immune_memory', label: 'Antibody & T-Cell Memory', shortDescription: 'Antigen-presenting cells train long-term B-cells to recognize live virus instantly' },
    ],
    edges: [
      {
        id: 'edge_delivery_to_trans',
        fromNodeId: 'lipid_mrna_delivery',
        toNodeId: 'ribosomal_translation',
        requiredMechanism: 'Lipid nanoparticles fuse with cellular membranes, releasing mRNA into the cytoplasm where ribosomes translate it into spike proteins.',
      },
      {
        id: 'edge_trans_to_memory',
        fromNodeId: 'ribosomal_translation',
        toNodeId: 'adaptive_immune_memory',
        requiredMechanism: 'Spike proteins migrate to cell surfaces, triggering dendritic cells to activate memory B-cells and neutralizing antibodies.',
      },
    ],
  },
  {
    id: 'action-potentials-neurotransmission',
    title: 'Action Potentials & Synaptic Transmission',
    domain: 'Biology, Medicine & Neuroscience',
    stage: 3,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    description: 'How a thought travels at 100 meters per second as an electrochemical wave across billions of interconnected brain neurons.',
    studentPriors: 'I know the brain has electricity, but how does an electrical spark jump across the physical gap between two separate nerve cells?',
    starterPrompt: 'When you decide to move your finger, what electrical and chemical cascade carries the command from one neuron to the next across the synaptic gap?',
    keyCausalComponents: [
      'Voltage-gated sodium channels open, generating a rapid electrical depolarization spike down the axon',
      'Depolarization reaches axon terminal, triggering calcium influx to fuse synaptic vesicles',
      'Neurotransmitters diffuse across synaptic cleft to activate ligand-gated receptors on recipient dendrite',
    ],
    nodes: [
      { id: 'voltage_depolarization', label: 'Axonal Depolarization (Na+ Influx)', shortDescription: 'Opening voltage-gated ion channels propels an electrical wave down the axon' },
      { id: 'synaptic_vesicle_release', label: 'Vesicle Fusion & Exocytosis', shortDescription: 'Calcium triggers neurotransmitter vesicles to dump chemicals across the cleft' },
      { id: 'post_synaptic_firing', label: 'Post-Synaptic Receptor Activation', shortDescription: 'Neurotransmitters bind receptors to trigger the next neuron’s threshold' },
    ],
    edges: [
      {
        id: 'edge_depol_to_vesicle',
        fromNodeId: 'voltage_depolarization',
        toNodeId: 'synaptic_vesicle_release',
        requiredMechanism: 'Electrical voltage reaching the terminal opens voltage-gated Ca2+ channels, causing neurotransmitter vesicles to fuse with the presynaptic membrane.',
      },
      {
        id: 'edge_vesicle_to_post',
        fromNodeId: 'synaptic_vesicle_release',
        toNodeId: 'post_synaptic_firing',
        requiredMechanism: 'Neurotransmitters cross the 20nm synaptic cleft and bind receptors, opening ion channels that propagate the impulse in the recipient neuron.',
      },
    ],
  },

  // ==========================================
  // TRACK: ECONOMICS, MARKETS & HUMAN SYSTEMS
  // ==========================================
  {
    id: 'supply-demand-equilibrium',
    title: 'Supply, Demand & Price Equilibrium',
    domain: 'Economics, Markets & Human Systems',
    stage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    description: 'How millions of decentralized buyers and sellers coordinate the fair price and quantity of goods without any central authority.',
    studentPriors: 'I see prices on store shelves, but I thought companies simply charge whatever maximum number they want. How does a market find a single stable balance?',
    starterPrompt: 'If store owners want to charge as much money as possible, and buyers want to pay as little as possible, how does the price of everyday goods stabilize without a central coordinator?',
    keyCausalComponents: [
      'Demand curves decline with price while supply curves rise with price',
      'Shortages push prices upward as buyers compete; surpluses force markdowns to clear unsold inventory',
      'Market clearing equilibrium settles where quantity demanded precisely equals quantity supplied',
    ],
    nodes: [
      { id: 'opposing_incentives', label: 'Opposing Consumer & Producer Incentives', shortDescription: 'Buyers seek lower prices; sellers produce more at higher prices' },
      { id: 'price_feedback_loop', label: 'Shortage & Surplus Feedback', shortDescription: 'Excess demand pushes prices up; excess unsold goods forces prices down' },
      { id: 'clearing_equilibrium', label: 'Equilibrium Price Discovery', shortDescription: 'The self-balancing intersection where quantity demanded matches supply' },
    ],
    edges: [
      {
        id: 'edge_incentives_to_feedback',
        fromNodeId: 'opposing_incentives',
        toNodeId: 'price_feedback_loop',
        requiredMechanism: 'Mismatches between buyer willingness to pay and seller willingness to produce trigger immediate inventory surpluses or deficits.',
      },
      {
        id: 'edge_feedback_to_equilibrium',
        fromNodeId: 'price_feedback_loop',
        toNodeId: 'clearing_equilibrium',
        requiredMechanism: 'Price movements continuously clear backlogs until the exact clearing price is reached where supply equals demand.',
      },
    ],
  },
  {
    id: 'compound-interest-exponential',
    title: 'Compound Interest & Exponential Growth',
    domain: 'Economics, Markets & Human Systems',
    stage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    description: 'Why reinvesting earned yields creates explosive exponential curves that completely surpass linear effort over time.',
    studentPriors: 'I know what interest is: a bank gives you a small percentage fee. But why do mathematicians call compounding a superpower if the annual rate is only 7%?',
    starterPrompt: 'Why is compound interest considered fundamentally different from normal linear savings, if the percentage return each year is relatively small?',
    keyCausalComponents: [
      'Principal yields an initial return in period one',
      'The earned interest is not withdrawn; it is added to the principal base for subsequent periods',
      'Interest begins earning interest on itself, transforming linear addition into an exponential growth curve',
    ],
    nodes: [
      { id: 'initial_yield', label: 'Base Principal & Yield', shortDescription: 'Original deposit generating modest initial returns' },
      { id: 'reinvestment_cycle', label: 'Yield Capitalization', shortDescription: 'Past returns fold into new principal rather than being spent' },
      { id: 'exponential_cascade', label: 'Compounding Curve', shortDescription: 'Growth rate accelerates exponentially as the yield base eclipses contributions' },
    ],
    edges: [
      {
        id: 'edge_yield_to_reinvest',
        fromNodeId: 'initial_yield',
        toNodeId: 'reinvestment_cycle',
        requiredMechanism: 'Instead of removing earned profits, gains are added back into the capital asset to form a larger compounding base.',
      },
      {
        id: 'edge_reinvest_to_cascade',
        fromNodeId: 'reinvestment_cycle',
        toNodeId: 'exponential_cascade',
        requiredMechanism: 'Because returns scale proportionally with total accumulated balance, future gains become exponential rather than linear.',
      },
    ],
  },
  {
    id: 'fractional-reserve-banking-money',
    title: 'Fractional Reserve Banking & Money Creation',
    domain: 'Economics, Markets & Human Systems',
    stage: 3,
    imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=800&q=80',
    description: 'How commercial banks literally create new money out of thin air through the loan multiplication cycle.',
    studentPriors: 'I thought banks stored all deposited cash in a giant vault like a safe. How can a $1,000 deposit turn into $10,000 in the wider economy?',
    starterPrompt: 'When someone deposits cash in a bank, how does the fractional reserve system multiply that single deposit into ten times as much active purchasing power?',
    keyCausalComponents: [
      'Bank keeps a mandatory reserve fraction (e.g. 10%) and lends out the remainder',
      'The borrower deposits the borrowed loan into another bank account',
      'Successive deposit and loan cycles create new digital credit that functions as spendable money',
    ],
    nodes: [
      { id: 'initial_cash_deposit', label: 'Primary Reserve Deposit', shortDescription: 'Base currency deposited into bank vault and balance sheet' },
      { id: 'fractional_lending_cycle', label: 'Fractional Loan Re-Lending', shortDescription: 'Bank retains fraction and extends credit to borrower who spends it' },
      { id: 'money_multiplier_expansion', label: 'Broad Money Supply Expansion', shortDescription: 'Series of recursive re-deposits expands commercial money supply M2' },
    ],
    edges: [
      {
        id: 'edge_dep_to_loan',
        fromNodeId: 'initial_cash_deposit',
        toNodeId: 'fractional_lending_cycle',
        requiredMechanism: 'The bank treats 90% of the deposit as excess reserves and issues a new loan, creating a corresponding digital checking balance.',
      },
      {
        id: 'edge_loan_to_exp',
        fromNodeId: 'fractional_lending_cycle',
        toNodeId: 'money_multiplier_expansion',
        requiredMechanism: 'When the borrower spends the funds, recipient banks repeat the reserve fraction cycle, multiplying the total money supply.',
      },
    ],
  },

  // ==========================================
  // TRACK: PHILOSOPHY, LOGIC & FIRST PRINCIPLES
  // ==========================================
  {
    id: 'bayesian-belief-updating',
    title: "Bayes' Theorem & Rational Belief Updating",
    domain: 'Philosophy, Logic & First Principles',
    stage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'How to mathematically calibrate your confidence in a hypothesis when confronted with noisy new evidence.',
    studentPriors: 'I thought tests were either right or wrong. If a disease test is 99% accurate and you test positive, why might your chance of having it still be low?',
    starterPrompt: 'If a medical screening test has 99% accuracy and you test positive, why does Bayes’ theorem show you might only have a 9% chance of actually being sick?',
    keyCausalComponents: [
      'Prior probability represents the baseline frequency in the general population',
      'Likelihood of new evidence updates the prior weight according to test false-positive rates',
      'Posterior probability balances base rates against the evidentiary signal strength',
    ],
    nodes: [
      { id: 'base_rate_prior', label: 'Base Rate Prior P(H)', shortDescription: 'Initial statistical rarity of the condition before observing new data' },
      { id: 'likelihood_ratio', label: 'Likelihood of Evidence P(E|H)', shortDescription: 'Ratio of true positives compared to false positives in the uninfected' },
      { id: 'posterior_probability', label: 'Updated Posterior P(H|E)', shortDescription: 'Calibrated certainty derived from multiplying prior by likelihood' },
    ],
    edges: [
      {
        id: 'edge_prior_to_ratio',
        fromNodeId: 'base_rate_prior',
        toNodeId: 'likelihood_ratio',
        requiredMechanism: 'Because rare conditions mean healthy people vastly outnumber sick people, even a 1% false positive rate generates more false alarms than true cases.',
      },
      {
        id: 'edge_ratio_to_post',
        fromNodeId: 'likelihood_ratio',
        toNodeId: 'posterior_probability',
        requiredMechanism: 'Bayesian conditioning normalizes true positives against the sum of all positive signals to yield the true posterior probability.',
      },
    ],
  },
  {
    id: 'hard-problem-of-consciousness',
    title: 'The Hard Problem of Consciousness',
    domain: 'Philosophy, Logic & First Principles',
    stage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'Why objective electrical brain signals don’t inherently explain the subjective felt sensation of the color red or pain.',
    studentPriors: 'I know the brain has neurons that fire signals when light hits the eye. But why do philosophers say there is an explanatory gap between brain cells and feelings?',
    starterPrompt: 'If science can map every neuron firing when you taste a strawberry, why does David Chalmers argue that still doesn’t explain the subjective experience of sweetness?',
    keyCausalComponents: [
      'Physical third-person brain states (action potentials, neurochemistry) explain functional behavior',
      'Subjective first-person qualia (the raw inner feeling of redness, pain, or joy) cannot be directly deduced from physical states',
      'The explanatory gap: No description of physical mechanism logically forces subjective experience into existence',
    ],
    nodes: [
      { id: 'physical_neurochemistry', label: 'Third-Person Neural Firing', shortDescription: 'Objective mechanical brain states and synaptic transmission' },
      { id: 'subjective_qualia', label: 'First-Person Qualia', shortDescription: 'The subjective, raw experiential sensation of being alive and feeling' },
      { id: 'explanatory_gap', label: 'The Explanatory Gap', shortDescription: 'The logical divide where physical descriptions fail to account for why feeling exists at all' },
    ],
    edges: [
      {
        id: 'edge_neuro_to_qualia',
        fromNodeId: 'physical_neurochemistry',
        toNodeId: 'subjective_qualia',
        requiredMechanism: 'Physical sensory organs transform photons into electrical spikes, but subjective experience accompanies these functional operations.',
      },
      {
        id: 'edge_qualia_to_gap',
        fromNodeId: 'subjective_qualia',
        toNodeId: 'explanatory_gap',
        requiredMechanism: 'Because one could conceive of a philosophical zombie processing inputs without inner experience, physical function alone leaves conscious qualia unexplained.',
      },
    ],
  },
  {
    id: 'occams-razor-model-complexity',
    title: "Occam's Razor & Model Selection",
    domain: 'Philosophy, Logic & First Principles',
    stage: 3,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'Why theories that require fewer unprovable assumptions are mathematically more likely to be true across physics and machine learning.',
    studentPriors: 'People say the simplest explanation is usually right. But why would the universe care about human simplicity?',
    starterPrompt: 'Why is an explanation with fewer assumptions mathematically favored over an intricate conspiracy theory that fits all the same facts?',
    keyCausalComponents: [
      'Every unnecessary auxiliary assumption multiplies conditional probabilities, reducing overall likelihood',
      'Overfitting: Highly complex theories fit historical noise rather than the underlying generative signal',
      'Parsimonious generalization: Models with minimal parameters exhibit vastly superior predictive accuracy on unseen data',
    ],
    nodes: [
      { id: 'auxiliary_assumptions', label: 'Auxiliary Assumptions & Parameters', shortDescription: 'Unobserved hypotheses and ad-hoc conditions added to explain an anomaly' },
      { id: 'joint_probability_decay', label: 'Multiplicative Probability Penalty', shortDescription: 'Each independent assumption compounds to slash the joint prior probability' },
      { id: 'parsimonious_generalization', label: 'Generalization & Predictive Power', shortDescription: 'Minimalist models capture true signal rather than fitting noise' },
    ],
    edges: [
      {
        id: 'edge_assump_to_decay',
        fromNodeId: 'auxiliary_assumptions',
        toNodeId: 'joint_probability_decay',
        requiredMechanism: 'Because probabilities are <= 1, multiplying P(A) * P(B) * P(C) drastically reduces the likelihood of complex multi-layered hypotheses.',
      },
      {
        id: 'edge_decay_to_gen',
        fromNodeId: 'joint_probability_decay',
        toNodeId: 'parsimonious_generalization',
        requiredMechanism: 'Penalizing gratuitous parameter complexity prevents overfitting, maximizing out-of-sample predictive robustness.',
      },
    ],
  },
];

/**
 * Filter and personalize curated concepts based on user profile preferences.
 */
export function getPersonalizedRoadmap(
  preferredDomain?: string,
  focusGoal?: string,
  extraPersonalizedConcepts: ConceptChallenge[] = []
): {
  primaryTrack: DomainTrackInfo;
  roadmapConcepts: ConceptChallenge[];
  otherTracks: DomainTrackInfo[];
} {
  const normDomain = preferredDomain?.toLowerCase().trim() || '';

  // Find matching domain track
  const matchedTrack =
    DOMAIN_TRACKS.find(
      (t) =>
        t.id.toLowerCase() === normDomain ||
        t.shortName.toLowerCase() === normDomain ||
        normDomain.includes(t.shortName.toLowerCase()) ||
        t.id.toLowerCase().includes(normDomain)
    ) || DOMAIN_TRACKS[0];

  // Get base concepts for this domain
  let conceptsForTrack = CURATED_CONCEPTS.filter(
    (c) => c.domain.toLowerCase() === matchedTrack.id.toLowerCase()
  );

  // If extra personalized concepts exist for this track, prepend them
  const customTrackConcepts = extraPersonalizedConcepts.filter(
    (c) =>
      c.domain.toLowerCase() === matchedTrack.id.toLowerCase() ||
      c.domain.toLowerCase() === matchedTrack.shortName.toLowerCase()
  );

  const combined = [...customTrackConcepts, ...conceptsForTrack];

  // Sort by stage (1 -> 2 -> 3)
  combined.sort((a, b) => (a.stage || 1) - (b.stage || 1));

  const otherTracks = DOMAIN_TRACKS.filter((t) => t.id !== matchedTrack.id);

  return {
    primaryTrack: matchedTrack,
    roadmapConcepts: combined,
    otherTracks,
  };
}

export function createCustomConcept(title: string, domain?: string, description?: string): ConceptChallenge {
  const cleanTitle = title.trim();
  return {
    id: `custom-${Date.now()}`,
    title: cleanTitle,
    domain: domain?.trim() || 'Custom Knowledge Domain',
    stage: 1,
    description: description?.trim() || `Teaching the fundamental causal mechanisms of ${cleanTitle}.`,
    studentPriors: `I don't know how ${cleanTitle} works yet. I will only know what you communicate.`,
    starterPrompt: `I am eager to learn about "${cleanTitle}", but I have zero prior background. Where should we start?`,
    keyCausalComponents: [
      'Foundational starting premise and components',
      'Step-by-step causal mechanism connecting them',
      'Resulting observable outcome',
    ],
    nodes: [
      { id: 'cust_premise', label: 'Foundational Premises', shortDescription: 'The starting elements or components' },
      { id: 'cust_mechanism', label: 'Causal Mechanism', shortDescription: 'The action or transformation process' },
      { id: 'cust_outcome', label: 'Operational Outcome', shortDescription: 'The resulting state or resolution' },
    ],
    edges: [
      {
        id: 'edge_premise_to_mech',
        fromNodeId: 'cust_premise',
        toNodeId: 'cust_mechanism',
        requiredMechanism: 'How the foundational premises initiate or drive the core mechanism.',
      },
      {
        id: 'edge_mech_to_out',
        fromNodeId: 'cust_mechanism',
        toNodeId: 'cust_outcome',
        requiredMechanism: 'How the mechanism produces the final observable outcome.',
      },
    ],
    isCustom: true,
  };
}
