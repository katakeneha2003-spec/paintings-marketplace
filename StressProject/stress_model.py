import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load data
data = pd.read_csv("data.csv")

# Inputs and output
X = data[['heart_rate', 'gsr', 'temperature']]
y = data['stress']

# Normalize data
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
X = scaler.fit_transform(X)

# Convert to sequences
def create_seq(X, y, steps=3):
    Xs, ys = [], []
    for i in range(len(X)-steps):
        Xs.append(X[i:i+steps])
        ys.append(y[i+steps])
    return np.array(Xs), np.array(ys)

X, y = create_seq(X, y)

# Split data
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Build model
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

model = Sequential()
model.add(LSTM(50, input_shape=(X.shape[1], X.shape[2])))
model.add(Dense(1, activation='sigmoid'))

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train model
model.fit(X_train, y_train, epochs=20)

# Test model
loss, acc = model.evaluate(X_test, y_test)
print("Accuracy:", acc)

pred = model.predict(X_test)

for i in range(len(pred)):
    print("Raw value:", pred[i][0])   # shows probability
    
    if pred[i][0] > 0.55:
        print("Stress")
    else:
        print("No Stress")


        import matplotlib.pyplot as plt

# Convert predictions to 0 or 1
pred_binary = [1 if p[0] > 0.55 else 0 for p in pred]

# Plot graph
plt.plot(y_test, label="Actual")
plt.plot(pred_binary, label="Predicted")

plt.title("Stress Detection: Actual vs Predicted")
plt.xlabel("Sample")
plt.ylabel("Stress (0 = No Stress, 1 = Stress)")
plt.legend()

plt.show()