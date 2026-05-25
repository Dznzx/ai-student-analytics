import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split

from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (

    roc_curve,
    roc_auc_score

)


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


# MODEL

model = LogisticRegression()

model.fit(X_train, y_train)


# PREDICTION PROBABILITIES

probabilities = model.predict_proba(
    X_test
)[:, 1]


# ROC CURVE

fpr, tpr, thresholds = roc_curve(

    y_test,
    probabilities

)


# AUC SCORE

auc_score = roc_auc_score(

    y_test,
    probabilities

)


print(f"\nAUC Score: {auc_score:.2f}")


# PLOT ROC CURVE

plt.figure(figsize=(8, 6))

plt.plot(

    fpr,
    tpr,
    label=f"AUC = {auc_score:.2f}"

)

plt.plot(
    [0, 1],
    [0, 1],
    linestyle="--"
)

plt.xlabel(
    "False Positive Rate"
)

plt.ylabel(
    "True Positive Rate"
)

plt.title(
    "ROC Curve Analysis"
)

plt.legend()

plt.savefig(
    "roc_curve.png"
)

print(
    "\nROC curve saved!"
)