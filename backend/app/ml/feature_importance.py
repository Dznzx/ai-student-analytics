import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier

from sklearn.model_selection import train_test_split


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

features = [
    "absences",
    "studytime",
    "failures"
]

X = df[features]


# TARGET

y = df["risk"]


# SPLIT DATA

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    random_state=42

)


# RANDOM FOREST MODEL

model = RandomForestClassifier()

model.fit(X_train, y_train)


# FEATURE IMPORTANCE

importance = model.feature_importances_


# CREATE DATAFRAME

importance_df = pd.DataFrame({

    "Feature": features,

    "Importance": importance

})


# SORT VALUES

importance_df = importance_df.sort_values(

    by="Importance",

    ascending=False

)


print("\nFEATURE IMPORTANCE\n")

print(importance_df)


# PLOT GRAPH

plt.figure(figsize=(8, 5))

plt.bar(

    importance_df["Feature"],

    importance_df["Importance"]

)

plt.title(
    "Feature Importance Analysis"
)

plt.xlabel("Features")

plt.ylabel("Importance Score")

plt.savefig(
    "feature_importance.png"
)

print(
    "\nFeature importance graph saved!"
)