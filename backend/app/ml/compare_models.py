import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split

from sklearn.metrics import (

    accuracy_score,
    precision_score,
    recall_score,
    f1_score

)

from sklearn.linear_model import LogisticRegression

from sklearn.tree import DecisionTreeClassifier

from sklearn.ensemble import RandomForestClassifier


# LOAD DATASET

df = pd.read_csv(
    "student-mat.csv",
    sep=","
)


# CREATE RISK COLUMN

df["risk"] = df["G3"].apply(

    lambda x: 1 if x < 10 else 0

)


# FEATURES

X = df[[
    "absences",
    "studytime",
    "failures"
]]


# TARGET

y = df["risk"]


# SPLIT DATA

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    random_state=42

)


# MODELS

models = {

    "Logistic Regression":
    LogisticRegression(),

    "Decision Tree":
    DecisionTreeClassifier(),

    "Random Forest":
    RandomForestClassifier()

}


# STORE RESULTS

results = {

    "Model": [],
    "Accuracy": [],
    "Precision": [],
    "Recall": [],
    "F1 Score": []

}


# TRAIN + EVALUATE

for name, model in models.items():

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions
    )

    recall = recall_score(
        y_test,
        predictions
    )

    f1 = f1_score(
        y_test,
        predictions
    )

    print(f"\n{name}")

    print(f"Accuracy: {accuracy:.2f}")
    print(f"Precision: {precision:.2f}")
    print(f"Recall: {recall:.2f}")
    print(f"F1 Score: {f1:.2f}")

    results["Model"].append(name)

    results["Accuracy"].append(accuracy)

    results["Precision"].append(precision)

    results["Recall"].append(recall)

    results["F1 Score"].append(f1)


# RESULTS DATAFRAME

results_df = pd.DataFrame(results)

print("\nFINAL MODEL COMPARISON\n")

print(results_df)


# PLOT ACCURACY GRAPH

plt.figure(figsize=(10, 6))

plt.bar(

    results_df["Model"],

    results_df["Accuracy"]

)

plt.title(
    "Model Accuracy Comparison"
)

plt.ylabel("Accuracy")

plt.xlabel("Models")

plt.savefig(
    "model_comparison.png"
)

print(
    "\nModel comparison graph saved!"
)