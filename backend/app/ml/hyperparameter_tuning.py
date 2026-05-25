import pandas as pd

from sklearn.model_selection import (

    train_test_split,
    GridSearchCV

)

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import accuracy_score


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


# BASE MODEL

model = RandomForestClassifier()


# PARAMETERS TO TEST

param_grid = {

    "n_estimators": [
        50,
        100,
        200
    ],

    "max_depth": [
        3,
        5,
        10
    ],

    "min_samples_split": [
        2,
        5,
        10
    ]

}


# GRID SEARCH

grid_search = GridSearchCV(

    estimator=model,

    param_grid=param_grid,

    cv=5,

    scoring="accuracy",

    n_jobs=-1

)


# TRAIN GRID SEARCH

grid_search.fit(
    X_train,
    y_train
)


# BEST MODEL

best_model = grid_search.best_estimator_


# PREDICTIONS

predictions = best_model.predict(
    X_test
)


# ACCURACY

accuracy = accuracy_score(
    y_test,
    predictions
)


# RESULTS

print("\nBEST PARAMETERS\n")

print(
    grid_search.best_params_
)

print(
    f"\nBest Accuracy: {accuracy:.2f}"
)