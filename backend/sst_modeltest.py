# Load the trained model
model = tf.keras.models.load_model("saved_model/sentiment_model")

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
    prediction = model.predict(padded_sequence)
    sentiment = prediction[0]
    # sentiment = "Positive" if prediction[0] >= 0.5 else "Negative"

    return jsonify({"sentiment": sentiment})
