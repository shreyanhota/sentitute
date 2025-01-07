import numpy as np
import tensorflow as tf
from datasets import load_dataset
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, SpatialDropout1D
from tensorflow.keras.optimizers import Adam
from flask import Flask, jsonify, request, url_for
from threading import Thread
from flask_socketio import SocketIO, emit
import matplotlib.pyplot as plt
import os
from flask_cors import CORS




# Initialize Flask app and SocketIO
app = Flask(__name__)


# Enable CORS for all domains (or specify the React app URL for more security)
# Enable CORS for the specific origin
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize SocketIO with Flask
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# Load SST dataset
dataset = load_dataset("sst", name="default", trust_remote_code=True)

# Dataset preprocessing function
def dataset_to_numpy_binary(data_split):
    sentences = [example["sentence"] for example in data_split]
    labels = [example["label"] for example in data_split]
    sentences_np = np.array(sentences, dtype=object)
    labels_np = np.array(labels, dtype=np.float32)
    labels_binary = np.round(labels_np)
    return sentences_np, labels_binary

# Preprocess datasets
train_sentences, train_labels = dataset_to_numpy_binary(dataset["train"])
val_sentences, val_labels = dataset_to_numpy_binary(dataset["validation"])
test_sentences, test_labels = dataset_to_numpy_binary(dataset["test"])

# Text tokenization and padding
vocab_size = 100000
max_length = 30

tokenizer = Tokenizer(num_words=vocab_size, oov_token="<OOV>")
tokenizer.fit_on_texts(train_sentences)

train_sequences = tokenizer.texts_to_sequences(train_sentences)
val_sequences = tokenizer.texts_to_sequences(val_sentences)
test_sequences = tokenizer.texts_to_sequences(test_sentences)

train_padded = pad_sequences(train_sequences, maxlen=max_length, padding="post", truncating="post")
val_padded = pad_sequences(val_sequences, maxlen=max_length, padding="post", truncating="post")
test_padded = pad_sequences(test_sequences, maxlen=max_length, padding="post", truncating="post")

# Model architecture
def create_model():
    model = Sequential()
    model.add(Embedding(input_dim=vocab_size, output_dim=128, input_length=max_length))
    model.add(SpatialDropout1D(0.2))
    model.add(LSTM(100, dropout=0.2, recurrent_dropout=0.2))
    model.add(Dense(1, activation="sigmoid"))
    model.compile(loss="binary_crossentropy", optimizer=Adam(learning_rate=0.001), metrics=["accuracy"])
    return model

# Model training function
def train_and_visualize(batch_size, epochs):
    model = create_model()

    train_accuracy = []
    val_accuracy = []

    class ProgressCallback(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            progress = (epoch + 1) / epochs * 100
            socketio.emit('progress', {'progress': progress})
            train_accuracy.append(logs['accuracy'])
            val_accuracy.append(logs['val_accuracy'])
            socketio.emit("plot_data", {
                "train_accuracy": train_accuracy,
                "val_accuracy": val_accuracy
            })

    history = model.fit(
        train_padded,
        train_labels,
        validation_data=(val_padded, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[ProgressCallback()]
    )


    loss, accuracy = model.evaluate(train_padded, train_labels)

    # Model evaluation
    metrics = {
        "accuracy": accuracy,
        "loss": loss,
    }

    socketio.emit("model_metrics", metrics)

    # Save the model
    model.save("sentiment_analysis_model.h5")

    # plt.plot(history.history['accuracy'], label='Training Accuracy')
    # plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    # plt.title("Training and Validation Accuracy")
    # plt.xlabel("Epochs")
    # plt.ylabel("Accuracy")
    # plt.legend()

    # plot_path = os.path.join('static', "model_accuracy.png")
    # plt.savefig(plot_path)
    # plt.close()

     # Pass the data for plotting to the main thread
    # socketio.emit('training_complete', {
    #     'accuracy': accuracy,
    #     'loss': loss,
    #     'val_accuracy': history.history['val_accuracy'][-1],
    #     'val_loss': history.history['val_loss'][-1],
    #     'image_url': url_for('static', filename="model_accuracy.png", _external=True)
    # })

from tensorflow.keras.models import load_model

model = load_model("sentiment_analysis_model.h5")

@app.route("/analyze", methods=["POST"])
def analyze_text():
    data = request.get_json()
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Tokenize and pad the input text
    sequence = tokenizer.texts_to_sequences([text])
    padded_sequence = pad_sequences(sequence, maxlen=max_length, padding="post", truncating="post")
    
    # Predict sentiment
    prediction = model.predict(padded_sequence)[0][0]  # Probability of being positive sentiment
    sentiment_percentage = float(prediction * 100)  # Convert to percentage

    return jsonify({"sentiment_percentage": sentiment_percentage})

    # Route to start the training process
@app.route('/start_training', methods=['POST'])
def start_training():
    data = request.get_json()
    batch_size = data.get('batch_size', 64)
    epochs = data.get('epochs', 20)

    # Run training in a background thread
    thread = Thread(target=train_and_visualize, args=(batch_size, epochs))
    thread.start()

    return jsonify({"status": "Training started!"})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)