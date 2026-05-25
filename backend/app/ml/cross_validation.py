import pandas as pd
import matplotlib.pyplot as plt

from sklearn.linear_model import LogisticRegression

from sklearn.model_selection import cross_val_score


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


# MODEL

model = LogisticRegression()


# CROSS VALIDATION

scores = cross_val_score(

    model,

    X,

    y,

    cv=5,

    scoring="accuracy"

)


print("\nCROSS VALIDATION SCORES\n")

print(scores)


# AVERAGE SCORE

average_score = scores.mean()

print(
    f"\nAverage Accuracy: {average_score:.2f}"
)


# PLOT SCORES

plt.figure(figsize=(8, 5))

plt.plot(

    range(1, 6),

    scores,

    marker="o"

)

plt.title(
    "Cross Validation Accuracy Scores"
)

plt.xlabel(
    "Fold Number"
)

plt.ylabel(
    "Accuracy"
)

plt.savefig(
    "cross_validation.png"
)

print(
    "\nCross validation graph saved!"
)