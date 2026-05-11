1. Research Title
ProCook: A Multimodal Transformer-Based Filipino Recipe Recommendation System Using Qwen 2.5 7B Instruct for Context-Aware Culinary Guidance

The refined title explicitly identifies the deep learning model employed (Qwen 2.5 7B Instruct), characterizes the methodological approach (multimodal Transformer-based), specifies the application domain (Filipino recipe recommendation), and highlights the target outcome (budget-, time-, and context-aware culinary guidance). These elements collectively satisfy the requirements for clarity, specificity, conciseness, and transparent disclosure of methodology and variables.

2. Rationale
2.1 Problem Statement
Filipino home cooking decisions are made under real-world constraints that existing digital platforms are ill-equipped to address. Households routinely navigate a complex intersection of variables — limited household budgets, available pantry ingredients, variable preparation time, and situation-specific preferences (e.g., comfort food during rainy days versus celebratory dishes for special occasions). While numerous recipe platforms offer search and filtering capabilities, their effectiveness is fundamentally constrained by reliance on exact keyword matches and consistently curated tags that rarely reflect how Filipino cooks naturally communicate culinary intent [1].
Three interrelated limitations characterize current systems. First, recipe descriptions and instructions frequently appear in Filipino (Tagalog), English, or Taglish — the creolized mixture of both languages — alongside regional naming variations and ingredient synonyms that differ by island, province, or family tradition. Traditional keyword-matching systems treat text as literal tokens and consequently fail to bridge these linguistic gaps [2]. Second, conventional search engines exhibit weak contextual understanding: a query such as 'mura na tanghalian may baboy' (cheap lunch with pork) embeds a cost constraint, a meal-type specification, and an ingredient preference simultaneously, but token-level methods process these dimensions independently and lose the composite intent. Third, single-modality limitations prevent existing systems from incorporating structured numeric signals — preparation time, cook time, servings count, and budget proxies — that are critical to practical cooking decisions. Systems that optimize only for semantic text similarity may recommend dishes that are contextually relevant but temporally or economically unrealistic.
Because of these compounding constraints, rule-based filtering, keyword search, and bag-of-words or TF-IDF ranking approaches remain brittle in practice. They struggle with context, synonymy, and multilingual phrasing, and they do not naturally integrate multiple heterogeneous signals [2]. The result is degraded match quality, inconsistent search outcomes, and increased trial-and-error that frustrates users. There is a clear and pressing need for Transformer-based and multimodal deep learning models capable of capturing semantic meaning across mixed-language text while simultaneously reasoning over structured numeric constraints.

2.2 Importance of the Study
The problem matters because food choice is a daily decision with direct consequences across multiple levels of society. At the individual and household level, a context-aware recommendation system can meaningfully reduce the time spent searching for suitable recipes, minimize food waste by surfacing dishes that match currently available ingredients, and help families adhere to tight budgets without sacrificing nutritional adequacy or culinary variety. For households already spending a disproportionate share of income on food — a reality documented in Philippine consumer expenditure surveys [5] — an intelligent recommendation assistant can function as a practical decision-support tool for daily meal planning.
Transformer-based and multimodal deep learning approaches offer qualitative improvements over conventional methods across three dimensions. They can infer meaning beyond exact keywords through semantic representation learning, enabling the system to understand that 'paborito ng bata' (children's favorite) and 'kid-friendly' express related intent [3]. They can handle multilingual and mixed-language inputs through pretrained multilingual Transformer representations — such as those embedded in Qwen 2.5 7B Instruct — without requiring separate language-specific models [4]. Finally, they can integrate multiple heterogeneous signals, combining textual semantics with numeric tabular features through multimodal fusion layers [6].

2.3 Global Context
Globally, recipe discovery and culinary guidance have undergone a significant shift toward digital platforms — applications, web communities, and conversational AI assistants. This transition has accelerated the demand for intelligent systems capable of understanding not only what a recipe contains, but also when and for whom it is appropriate. At the same time, the adoption of Transformer architectures has become the dominant paradigm in natural language processing and AI assistant design, owing to strong empirical performance in language understanding tasks ranging from classification and information extraction to summarization, retrieval, and conversational interaction [7].
The broader research community has increasingly recognized that real-world decision-making problems are inherently multimodal: they require combining heterogeneous data types rather than processing a single input stream [8]. In the culinary domain specifically, this fusion is particularly well-motivated: cooking decisions depend not only on textual descriptions and ingredient lists but also on numeric and contextual constraints such as preparation time, serving size, nutritional content, and cost. The emergence of large language models — including the Qwen 2.5 family [3][4] — with strong multilingual capabilities has further expanded the technical feasibility of deploying Transformer-based systems across non-English languages and code-switching environments.

2.4 Local Context (Philippines / Community)
In the Philippines, recipe discovery is strongly shaped by the intersection of local language, cultural food preferences, affordability, and ingredient availability. Filipino households allocate a substantial share of total expenditure to food [5], and the country's high internet penetration rate — supported by broad smartphone access — means that digital recipe platforms are a common reference point for daily meal planning. Despite this need, locally tailored AI systems remain considerably less common than generic global recipe search tools. Existing platforms are largely not optimized for Taglish semantics, regional dish names, or cost-sensitive cooking patterns that characterize Filipino households [1]. A Transformer-based multilingual approach paired with multimodal feature integration addresses this gap directly, providing a practical tool for Filipino home cooks navigating the daily challenge of preparing satisfying, affordable, and time-appropriate meals.

3. Objectives
3.1 General Objective
This study aims to develop and evaluate ProCook, a multimodal Transformer-based Filipino recipe recommendation system that leverages the Qwen 2.5 7B Instruct model to generate semantically rich textual representations and combines them with structured tabular recipe features — including preparation time, cook time, servings, and budget-related proxies — to produce context-aware recipe recommendations that are linguistically appropriate for Tagalog/Taglish inputs and practically aligned with Filipino household constraints.
3.2 Specific Objectives
3.2.1 Dataset Preparation
Curate and standardize the Filipino recipe dataset (CSV) by consolidating key textual fields — recipe name, description, ingredients list, step-by-step instructions, and tags — and extracting or deriving tabular features including preparation time, cook time, number of servings, and budget-related cost indicators. Validate completeness, handle missing or malformed records, and document the final schema for reproducibility.
3.2.2 Preprocessing Pipeline
Implement a comprehensive cleaning and preprocessing pipeline that addresses missing-value imputation, normalization and scaling of continuous tabular signals, encoding of categorical variables, and Transformer-based tokenization of multilingual text using the Qwen 2.5 7B Instruct tokenizer. The pipeline must handle Tagalog, English, and Taglish text without language-specific preprocessing branches.
3.2.3 Model Implementation
Construct a multimodal Transformer-based architecture that extracts semantic embeddings from recipe text fields using the Qwen 2.5 7B Instruct encoder, concatenates or fuses these representations with normalized tabular features through dedicated fusion layers, and produces multi-label or multi-class predictions for recipe attributes relevant to recommendation — including difficulty level, estimated cost category, mood or occasion suitability, and meal type.

3.2.4 Model Training and Testing
Fine-tune or adapt the Transformer-based backbone and train the multimodal fusion layers on stratified train/validation/test splits, applying cross-validation strategies where dataset size warrants it. Optimize hyperparameters including learning rate, batch size, dropout rates, and fusion layer dimensionality using validation performance as the selection criterion.
3.2.5 Performance Evaluation
Quantitatively evaluate system performance using classification metrics — accuracy, precision, recall, and F1-score with both micro and macro averaging appropriate for multi-label prediction tasks — and compare results against baseline systems including keyword/TF-IDF retrieval models and text-only Transformer classifiers [9].

4. Proposed Model
4.1 Model Overview
The proposed system employs a Multimodal Transformer-based deep learning architecture, specifically adapted from the Qwen 2.5 7B Instruct large language model developed by Alibaba Cloud [3][4]. This model selection reflects the dual requirements of the study: strong multilingual semantic understanding for Tagalog/Taglish text, and the capacity to integrate structured tabular signals through a multimodal fusion mechanism. The Qwen 2.5 7B Instruct architecture provides a pretrained multilingual encoder that has been exposed to large-scale multilingual corpora, including text from Southeast Asian languages, enabling effective representation of Filipino culinary language without requiring ground-up pretraining on a small local corpus.

4.2 Qwen 2.5 7B Instruct Architecture
The Qwen 2.5 7B Instruct model serves as the core text encoder of the proposed system. Its architectural specifications and components are summarized in the table below. The model employs a decoder-only Transformer design with Grouped Query Attention (GQA) and Rotary Position Embedding (RoPE), enabling efficient long-context processing. SwiGLU activations and RMSNorm pre-normalization contribute to training stability and representational capacity [3][4].
Component
Description
Architecture Type
Decoder-only Transformer with causal language modeling objective [3]
Parameters
7 Billion (7B) trainable parameters; instruction-tuned variant
Context Window
Up to 131,072 tokens (128K); max_len = 512 tokens used in this study
Tokenizer
Byte-Pair Encoding (BPE) with multilingual subword vocabulary (~150K tokens) [4]
Attention Mechanism
Grouped Query Attention (GQA) with Rotary Position Embedding (RoPE) [3]
Feed-Forward Network
SwiGLU activation with expanded intermediate dimension [4]
Normalization
RMSNorm applied before each sub-layer (pre-normalization) [3]
Multilingual Support
Pretrained on large-scale multilingual corpora including Southeast Asian languages [4]
Instruction Tuning
Supervised fine-tuning (SFT) on instruction-following datasets for task adaptation [3]
Output Embedding
Mean pooling over token dimension → fixed 4,096-dim semantic embedding vector

Table 1. Qwen 2.5 7B Instruct Architectural Components Used in ProCook
Model Adaptation
The Qwen 2.5 7B Instruct model will be applied to the Filipino recipe dataset through parameter-efficient fine-tuning using Low-Rank Adaptation (LoRA), which reduces computational overhead by inserting trainable rank-decomposition matrices into selected attention layers rather than updating all 7 billion parameters. The multimodal fusion layers — the dense layers connecting the concatenated embedding and tabular vector to the classification outputs — are trained from random initialization on the labeled recipe dataset. This two-stage adaptation strategy (frozen or partially frozen Transformer backbone + fully trained fusion and classification heads) is consistent with established practice in multimodal Transformer studies operating under limited labeled data conditions.

4.3 Model Components

4.3.1 Input Layers
The system accepts two distinct input streams: (a) concatenated textual fields — recipe name, description, ingredients, step-by-step instructions, and tags — forming a unified natural language document per recipe; and (b) a structured feature vector of normalized tabular attributes comprising preparation time, cook time, number of servings, and derived cost-level indicators.

4.3.2 Tokenization and Feature Extraction
The textual input is tokenized using the Qwen 2.5 7B Instruct tokenizer, which handles multilingual subword segmentation across Tagalog, English, and Taglish tokens [4]. Tabular features are min-max normalized and optionally one-hot encoded for categorical variables prior to fusion.

4.3.3 Transformer Encoder Layers
The tokenized text sequence is passed through the Qwen 2.5 7B Instruct encoder stack. Self-attention mechanisms allow the model to capture long-range dependencies and contextual meaning across the full recipe document — for example, relating an ingredient mentioned early in the recipe to a cost constraint implied in the tags [3]. A mean pooling operation produces a fixed 4,096-dimensional semantic embedding vector per recipe.

4.3.4 Fusion Mechanism
The semantic embedding from the Transformer encoder and the normalized tabular feature vector are concatenated into a combined representation. This combined vector is passed through one or more fully connected dense layers with ReLU activations and dropout regularization, enabling the network to learn cross-modal interactions [8] — for instance, recognizing that a recipe with a high cook time but low ingredient cost should be recommended differently from one with a short cook time but expensive ingredients.

4.3.5 Output and Classification Layer
The final dense layer produces multi-label predictions across the target attribute classes: difficulty level (easy, medium, hard), estimated cost category (budget, moderate, premium), meal type (breakfast, lunch, dinner, merienda, dessert), and mood/occasion suitability (everyday, comfort food, celebratory, rainy-day). A sigmoid activation with binary cross-entropy loss is used for multi-label classification; softmax with categorical cross-entropy is applied for mutually exclusive single-label targets.

4.4 Model Adaptation
The Qwen 2.5 7B Instruct model will be applied to the Filipino recipe dataset through parameter-efficient fine-tuning using Low-Rank Adaptation (LoRA) [10], which reduces computational overhead by inserting trainable rank-decomposition matrices into selected attention layers rather than updating all 7 billion parameters. The multimodal fusion layers are trained from random initialization on the labeled recipe dataset. This two-stage adaptation strategy (frozen or partially frozen Transformer backbone with fully trained fusion and classification heads) is consistent with established practice in multimodal Transformer studies operating under limited labeled data conditions [8].

4.5 Model Architecture Diagram
The following table presents the layer-by-layer structure of the proposed multimodal pipeline, from raw multilingual text and tabular input through to the final multi-label classification output.

Layer / Stage
Component
Output Shape
Notes
1. Text Input
Raw multilingual recipe text (Name + Desc + Ingredients + Steps + Tags)
Variable string
Tagalog / English / Taglish
2. Tokenization
Qwen 2.5 7B Instruct Tokenizer
[batch, max_len=512]
Subword BPE tokenization
3. Transformer Encoder
Qwen 2.5 7B (LoRA-adapted)
[batch, 4096]
Mean pooling over token dim
4. Tabular Input
Prep time, cook time, servings, cost proxy
[batch, N_tab]
Min-max normalized
5. Concatenation
Concat([text_emb, tab_features])
[batch, 4096 + N_tab]
Multimodal fusion point
6. Dense Layer 1
FC(4096 + N_tab → 512) + ReLU + Dropout(0.3)
[batch, 512]
Cross-modal interaction
7. Dense Layer 2
FC(512 → 128) + ReLU + Dropout(0.2)
[batch, 128]
Compressed representation
8. Output Layer
FC(128 → n_classes) + Sigmoid / Softmax
[batch, n_classes]
Multi-label predictions

Table 2. ProCook Multimodal Architecture — Layer-by-Layer Structure

5. Methodology
5.1 Research Design
This study employs a developmental and experimental research design focused on the creation, implementation, fine-tuning, and evaluation of a multimodal Transformer-based Filipino recipe recommendation system called ProCook. The study integrates natural language processing (NLP), multimodal machine learning, and classification-based deep learning techniques to analyze multilingual recipe data and generate context-aware culinary recommendations.
The research follows a supervised machine learning workflow in which labeled Filipino recipe data are collected, preprocessed, transformed into multimodal representations, and used to train and evaluate a Transformer-based recommendation model. The study also adopts a comparative experimental setup in which the proposed multimodal Qwen 2.5 7B Instruct model is evaluated against traditional NLP and text-only baseline systems.

6. Data Gathering
The primary dataset for this study is the Filipino recipe corpus assembled as part of the ProCook project, stored in CSV format [1]. The dataset is locally curated from publicly accessible Filipino recipe sources and contains records representing individual dishes. It is appropriate for this study because it is (a) domain-specific to Filipino cuisine, covering the full breadth of regional dishes, everyday meals, and celebratory recipes; (b) multilingual, containing text in Tagalog, English, and Taglish; and (c) multimodal in structure, combining natural language fields with numeric tabular attributes. The dataset attributes collected are detailed in the table below.
Field
Attribute
Description
Data Type
Source
Textual
Recipe Name
Title of the dish in Filipino or English
String
CSV Dataset [1]

Description
Short narrative overview of the recipe
String
CSV Dataset [1]

Ingredients List
Full list of ingredients with quantities
String
CSV Dataset [1]

Cooking Steps
Step-by-step cooking instructions
String
CSV Dataset [1]

Tags
Categorical labels: meal type, occasion, dietary
String / List
CSV Dataset [1]
Tabular
Preparation Time
Time (minutes) to prepare ingredients
Integer
CSV Dataset [1]

Cook Time
Time (minutes) to cook the dish
Integer
CSV Dataset [1]

Servings
Number of servings per recipe
Integer
CSV Dataset [1]

Cost Proxy
Derived budget indicator from ingredient count
Float / Category
Derived [2]

Table 3. Filipino Recipe Dataset — Collected Attributes, Data Types, and Sources

7. Data Preprocessing
The preprocessing pipeline operates sequentially across textual and tabular data streams before alignment and splitting.

7.1 Data Cleaning
Records with missing recipe names or empty ingredient lists are removed. Missing values in numeric fields (preparation time, cook time, servings) are imputed using median values computed from the training split. Duplicate records are identified via exact and near-duplicate matching on recipe name and ingredient list combinations, and one copy is retained.

7.2 Text Normalization
All textual fields are lowercased and stripped of extraneous whitespace. Unicode normalization (NFC) is applied to handle accented characters and Filipino diacritics. HTML artifacts, special characters unrelated to recipe content, and excessive punctuation are removed. Textual fields are concatenated in a consistent order: recipe name + description + ingredients + steps + tags, separated by special delimiter tokens.

7.3 Tabular Feature Processing
Continuous numeric features (preparation time, cook time, servings) are min-max scaled to the [0, 1] range. Categorical variables such as meal type and occasion tags are one-hot encoded. A budget proxy feature is derived by computing the number of unique non-pantry-staple ingredients as a cost indicator [2].

7.4 Transformer Tokenization
The concatenated text document for each recipe is tokenized using the Qwen 2.5 7B Instruct tokenizer with a maximum sequence length of 512 tokens [4]. Sequences exceeding this limit are truncated from the right (preserving the recipe name and the beginning of the description), while shorter sequences are padded with the tokenizer's pad token.

7.5 Label Encoding
Multi-label target attributes (difficulty, cost category, meal type, mood/occasion) are encoded as binary indicator vectors for multi-label classification tasks, or as integer class indices for single-label categorical targets.

7.6 Dataset Splitting
The dataset is partitioned into training (70%), validation (15%), and test (15%) splits using stratified sampling based on the primary target label distribution to ensure class balance across subsets [9]. For small dataset conditions, 5-fold stratified cross-validation is applied on the training split for hyperparameter selection.

8. Evaluation
8.1 Type of Evaluation
The proposed system is evaluated using a multi-faceted assessment framework that encompasses classification performance metrics, loss function monitoring, and comparative baseline evaluation. All quantitative metrics are computed on the held-out test set to ensure that reported figures reflect generalization performance rather than in-sample fit [9]. For multi-label classification tasks, both micro-averaged and macro-averaged variants of each metric are reported to capture both overall performance and per-class performance equitably across imbalanced label distributions.

8.2 Evaluation Metrics
The metrics used for evaluation are summarized in the table below, with each metric justified by its appropriateness to the multi-label classification structure of the recommendation task.
Metric
Definition
Application
Accuracy
Proportion of correctly predicted label sets over total samples
Single-label tasks (e.g., meal type)
Precision (Micro/Macro)
TP / (TP + FP) across labels
Multi-label: cost category, difficulty, mood
Recall (Micro/Macro)
TP / (TP + FN) across labels
Multi-label — minimizing missed relevant recommendations
F1-Score (Micro/Macro)
Harmonic mean of Precision and Recall
Primary metric for multi-label tasks; macro-F1 for imbalanced classes
Hamming Loss
Fraction of incorrectly predicted labels per sample
Multi-label overall error assessment
Subset Accuracy
Exact match ratio: all labels correct for a sample
Strict multi-label evaluation

Table 4. ProCook Evaluation Metrics — Definitions and Applications

8.3 Loss Function Evaluation
Binary Cross-Entropy (BCE) loss is used for multi-label classification targets, computed per class and averaged across all classes and samples in each batch. Categorical Cross-Entropy loss is applied for any mutually exclusive single-label targets. Training loss and validation loss are monitored across epochs to detect overfitting, with early stopping triggered when validation loss increases for five consecutive epochs. Learning curves (train vs. validation loss and macro F1-score versus epoch) are plotted for diagnostic purposes and included in the final results section [9].

8.4 Comparative Evaluation
To contextualize the performance of the proposed multimodal Transformer system, three baseline models are evaluated on identical train/validation/test splits:

8.4.1 TF-IDF with Logistic Regression
A classical NLP baseline that computes TF-IDF features from the concatenated recipe text and trains a one-vs-rest logistic regression classifier for each target label [2]. This baseline represents the performance ceiling of keyword-based retrieval approaches.

8.4.2 Text-Only Transformer
The same Qwen 2.5 7B Instruct backbone with identical LoRA configuration but without the tabular feature stream [3][4]. This baseline isolates the contribution of multimodal fusion to recommendation quality, enabling a direct test of whether integrating structured numeric features improves over text-only semantic representations.

8.4.3 Fine-Tuned Multilingual BERT
A multilingual BERT-scale model — mBERT or XLM-R [7] — fine-tuned on the same task and data, serving as a size-efficiency reference point to evaluate whether the larger Qwen model's capacity provides meaningful gains over more lightweight alternatives in this domain.
Performance differences across models are evaluated using paired t-tests on cross-validation fold scores or reported with 95% confidence intervals on test set metrics. Qualitative analysis of representative recommendation cases — including correct high-confidence predictions, failure modes, and cross-modal interaction examples — supplements the quantitative results to provide interpretable insights into system behavior [8].

9. References
[1]  ProCook Project Dataset. (n.d.). Filipino recipe corpus [CSV dataset]. Locally curated from publicly accessible Filipino recipe sources.
[2]  Manning, C. D., Raghavan, P., & Schutze, H. (2008). Introduction to information retrieval. Cambridge University Press.
[3]  Qwen Team. (2024). Qwen2.5 technical report. Alibaba Cloud. https://qwenlm.github.io/blog/qwen2.5/
[4]  Hui, B., Yang, J., Cui, Z., Yang, J., Liu, D., Zhang, L., ... & Lin, J. (2024). Qwen2.5-coder technical report. arXiv preprint arXiv:2409.12186.
[5]  Philippine Statistics Authority. (2021). 2018 family income and expenditure survey. PSA. https://psa.gov.ph
[6]  Baltrusaitis, T., Ahuja, C., & Morency, L. P. (2019). Multimodal machine learning: A survey and taxonomy. IEEE Transactions on Pattern Analysis and Machine Intelligence, 41(2), 423–443.
[7]  Conneau, A., Khandelwal, K., Goyal, N., Chaudhary, V., Wenzek, G., Guzman, F., ... & Stoyanov, V. (2020). Unsupervised cross-lingual representation learning at scale. In Proceedings of the 58th ACL (pp. 8440–8451).
[8]  Xu, C., Tao, D., & Xu, C. (2015). A survey on multi-view learning. arXiv preprint arXiv:1304.5634.
[9]  Tsoumakas, G., & Katakis, I. (2007). Multi-label classification: An overview. International Journal of Data Warehousing and Mining, 3(3), 1–13.
[10] Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., ... & Chen, W. (2022). LoRA: Low-rank adaptation of large language models. In Proceedings of ICLR 2022.
