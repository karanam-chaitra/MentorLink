import numpy as np
from sklearn.linear_model import LogisticRegression

X_train = np.array([
    [120, 4, 3, 0],
    [450, 18, 15, 4],
    [95, 3, 2, 0],
    [380, 14, 12, 3],
    [210, 8, 6, 1],
    [520, 22, 19, 5],
])
y_train = np.array([0, 1, 0, 1, 0, 1])

model = LogisticRegression()
model.fit(X_train, y_train)

modules = [
    ("mentorService.js", [110, 5, 4, 0]),
    ("app.js", [180, 9, 8, 1]),
    ("recommender.py", [140, 7, 10, 1]),
    ("RequestWorkflow.jsx", [290, 13, 14, 2]),
]

if __name__ == "__main__":
    print("Module Defect Risk Prediction:")
    for name, feats in modules:
        prob = model.predict_proba([feats])[0][1]
        label = "HIGH RISK" if prob >= 0.5 else "LOW RISK"
        print(f" - {name:20s} | Risk Prob: {prob:.2f} | {label}")
