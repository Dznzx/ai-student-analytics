import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LogisticRegression

from sklearn.model_selection import train_test_split

from sklearn.metrics import (

    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix

)


# LOAD DATASET

df = pd.read_csv(
    "student-mat.csv",
    sep=","
)


# CREATE RISK COLUMN

# HIGH RISK = final grade below 10

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


# PREDICTIONS

predictions = model.predict(X_test)


# METRICS

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


# PRINT RESULTS

print("\nREAL DATASET MODEL RESULTS\n")

print(f"Accuracy: {accuracy:.2f}")
print(f"Precision: {precision:.2f}")
print(f"Recall: {recall:.2f}")
print(f"F1 Score: {f1:.2f}")


# CONFUSION MATRIX

cm = confusion_matrix(
    y_test,
    predictions
)

plt.figure(figsize=(6, 5))

sns.heatmap(

    cm,

    annot=True,

    fmt="d",

    cmap="Blues",

    xticklabels=[
        "Low Risk",
        "High Risk"
    ],

    yticklabels=[
        "Low Risk",
        "High Risk"
    ]

)

plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.title(
    "Real Dataset Confusion Matrix"
)

plt.savefig(
    "real_confusion_matrix.png"
)


# SAVE MODEL

joblib.dump(
    model,
    "real_student_model.pkl"
)

print("\nReal dataset model saved successfully!")