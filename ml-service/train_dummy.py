# ml-service/train_dummy.py
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "best_model.pkl"

def main():
    print("Generating synthetic thyroid training dataset...")
    # Features: tsh, t3, tt4, fti, age, sex (1=Female, 0=Male)
    # Target: 0 = Normal, 1 = Hypothyroid, 2 = Hyperthyroid
    np.random.seed(42)
    n_samples = 300
    
    # Generate Normal cases
    normal_tsh = np.random.uniform(0.4, 4.0, int(n_samples * 0.6))
    normal_t3 = np.random.uniform(0.8, 2.0, int(n_samples * 0.6))
    normal_tt4 = np.random.uniform(60, 140, int(n_samples * 0.6))
    normal_fti = np.random.uniform(65, 155, int(n_samples * 0.6))
    normal_age = np.random.randint(18, 80, int(n_samples * 0.6))
    normal_sex = np.random.randint(0, 2, int(n_samples * 0.6))
    normal_y = np.zeros(int(n_samples * 0.6))
    
    # Generate Hypothyroid cases (elevated TSH, low T3/T4)
    hypo_tsh = np.random.uniform(5.0, 25.0, int(n_samples * 0.2))
    hypo_t3 = np.random.uniform(0.1, 0.7, int(n_samples * 0.2))
    hypo_tt4 = np.random.uniform(10, 55, int(n_samples * 0.2))
    hypo_fti = np.random.uniform(15, 60, int(n_samples * 0.2))
    hypo_age = np.random.randint(25, 85, int(n_samples * 0.2))
    hypo_sex = np.random.randint(0, 2, int(n_samples * 0.2))
    hypo_y = np.ones(int(n_samples * 0.2))
    
    # Generate Hyperthyroid cases (depressed TSH, high T3/T4)
    hyper_tsh = np.random.uniform(0.01, 0.35, int(n_samples * 0.2))
    hyper_t3 = np.random.uniform(2.1, 10.0, int(n_samples * 0.2))
    hyper_tt4 = np.random.uniform(145, 280, int(n_samples * 0.2))
    hyper_fti = np.random.uniform(160, 350, int(n_samples * 0.2))
    hyper_age = np.random.randint(18, 70, int(n_samples * 0.2))
    hyper_sex = np.random.randint(0, 2, int(n_samples * 0.2))
    hyper_y = np.full(int(n_samples * 0.2), 2)
    
    tsh = np.concatenate([normal_tsh, hypo_tsh, hyper_tsh])
    t3 = np.concatenate([normal_t3, hypo_t3, hyper_t3])
    tt4 = np.concatenate([normal_tt4, hypo_tt4, hyper_tt4])
    fti = np.concatenate([normal_fti, hypo_fti, hyper_fti])
    age = np.concatenate([normal_age, hypo_age, hyper_age])
    sex = np.concatenate([normal_sex, hypo_sex, hyper_sex])
    y = np.concatenate([normal_y, hypo_y, hyper_y])
    
    X = pd.DataFrame({
        "tsh": tsh,
        "t3": t3,
        "tt4": tt4,
        "fti": fti,
        "age": age,
        "sex": sex
    })
    
    # Train Random Forest Classifier
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    # Ensure models directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    
    print(f"Random Forest model successfully trained and saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()
