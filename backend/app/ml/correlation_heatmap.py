import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# LOAD DATASET

df = pd.read_csv(
    "student-mat.csv",
    sep=","
)


# CREATE RISK COLUMN

df["risk"] = df["G3"].apply(

    lambda x: 1 if x < 10 else 0

)


# SELECT FEATURES

selected_features = [

    "absences",
    "studytime",
    "failures",
    "G3",
    "risk"

]


# CORRELATION MATRIX

correlation = df[
    selected_features
].corr()


print("\nCORRELATION MATRIX\n")

print(correlation)


# PLOT HEATMAP

plt.figure(figsize=(8, 6))

sns.heatmap(

    correlation,

    annot=True,

    cmap="coolwarm"

)

plt.title(
    "Student Performance Correlation Heatmap"
)

plt.savefig(
    "correlation_heatmap.png"
)

print(
    "\nCorrelation heatmap saved!"
)