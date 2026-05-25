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


# SAMPLE DATASET

data = {

    "attendance": [
        95, 88, 72, 60, 55,
        91, 85, 77, 68, 50,
        92, 83, 74, 58, 48
    ],

    "cgpa": [
        9.1, 8.5, 7.0, 6.2, 5.8,
        9.3, 8.0, 7.2, 6.5, 5.5,
        9.0, 8.2, 7.1, 6.0, 5.2
    ],

    # 0 = LOW RISK
    # 1 = HIGH RISK

    "risk": [
        0, 0, 0, 1, 1,
        0, 0, 0, 1, 1,
        0, 0, 0, 1, 1
    ]
}


# DATAFRAME

df = pd.DataFrame(data)


# FEATURES

X = df[[
    "attendance",
    "cgpa"
]]


# TARGET

y = df["risk"]


# SPLIT

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

print("\nMODEL EVALUATION\n")

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
    "Student Risk Prediction Confusion Matrix"
)

plt.savefig(
    "confusion_matrix.png"
)

print(
    "\nConfusion matrix saved successfully!"
)


# SAVE MODEL

joblib.dump(
    model,
    "student_risk_model.pkl"
)

print(
    "Model saved successfully!"
)